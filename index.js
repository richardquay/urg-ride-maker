// Main bot file for URG Ride Maker
require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Events, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// Create collections for commands
client.commands = new Collection();
client.contextMenus = new Collection();

// Command handling setup
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    console.log(`Loaded command: ${command.data.name}`);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// Event handling setup
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  console.log(`Loaded event: ${event.name}`);
}

// Register commands with Discord
const commands = [];
client.commands.forEach(command => {
  commands.push(command.data.toJSON());
});

// Register context menus
if (client.contextMenus.size > 0) {
  client.contextMenus.forEach(menu => {
    commands.push(menu.data.toJSON());
  });
}

// Modal handler for custom location
client.on('interactionCreate', async interaction => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === 'custom-location-modal') {
    const locationName = interaction.fields.getTextInputValue('customLocationName');
    const locationUrl = interaction.fields.getTextInputValue('customLocationUrl');

    // Retrieve partial ride data
    const partialData = interaction.client.partialRideData?.get(interaction.user.id);
    if (!partialData) {
      await interaction.reply({ content: 'Something went wrong. Please try again.', ephemeral: true });
      return;
    }

    // Build the custom location object
    const customLocation = {
      name: locationName,
      url: locationUrl || null
    };

    // Prepare the ride data
    let startLocation = null;
    let endLocation = null;
    if (partialData.customLocationType === 'start') {
      startLocation = customLocation;
      // Set endLocation as you would normally (from partialData or default)
      if (partialData.endLocationInput && partialData.endLocationInput !== 'Other' && partialData.endLocationInput !== 'Same as start') {
        const config = require('./config/config');
        endLocation = config.defaultOptions.endLocations.find(loc => loc.name === partialData.endLocationInput);
      }
    } else {
      endLocation = customLocation;
      // Set startLocation as you would normally (from partialData or default)
      if (partialData.startLocationInput && partialData.startLocationInput !== 'Other') {
        const config = require('./config/config');
        startLocation = config.defaultOptions.locations.find(loc => loc.name === partialData.startLocationInput);
      }
    }

    // Now, reconstruct the rest of the ride data and call your ride creation logic
    const rideData = {
      vibe: partialData.vibe,
      type: partialData.type,
      dropStyle: partialData.dropStyleInput,
      date: partialData.dateInput,
      meetTime: partialData.timeInput,
      rolloutTime: partialData.rolloutTimeInput,
      startLocation,
      endLocation,
      distance: partialData.distanceInput,
      routeSource: partialData.routeSourceInput,
      creatorId: interaction.user.id
    };

    // Call your embed creation and posting logic here
    const { createRideEmbed, saveRide } = require('./utils/rideUtils');
    const embed = createRideEmbed(rideData, interaction.user);

    // Find the channel and post the embed
    const config = require('./config/config');
    const channelId = config.rideTypes[rideData.type].channelId;
    const channel = interaction.guild.channels.cache.get(channelId);

    if (!channel) {
      await interaction.reply({
        content: `Error: Channel for ${rideData.type} not found. Please check the channelId in config.js`,
        ephemeral: true
      });
      return;
    }

    const message = await channel.send({ embeds: [embed] });
    const rideTypeEmoji = config.rideTypes[rideData.type].emoji;
    await message.react(rideTypeEmoji);

    await saveRide(rideData, message.id, channel.id, interaction.client);

    await interaction.reply({
      content: `Your ${rideData.vibe} ${rideData.type} ride has been posted in the <#${channel.id}> channel!`,
      ephemeral: true
    });

    // Clean up
    interaction.client.partialRideData.delete(interaction.user.id);
  }
});

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();

// Log in to Discord with your client's token
client.login(process.env.BOT_TOKEN);