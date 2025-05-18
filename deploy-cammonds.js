// Script to register slash commands
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Load command data from each file
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command) {
    commands.push(command.data.toJSON());
    console.log(`Loaded command: ${command.data.name}`);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" property.`);
  }
}

// Check if we have commands to register
if (commands.length === 0) {
  console.log('No commands found to register.');
  process.exit(1);
}

// Create REST instance
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

// Register commands
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // Check if we're in development mode
    const isDevMode = process.env.DEV_MODE === 'true';
    
    let data;
    
    if (isDevMode && process.env.TEST_GUILD_ID) {
      // Register commands to a specific test server for faster testing
      data = await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.TEST_GUILD_ID),
        { body: commands },
      );
      console.log(`Running in development mode. Commands registered to guild ID: ${process.env.TEST_GUILD_ID}`);
    } else {
      // Register commands globally
      data = await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands },
      );
      console.log('Commands registered globally.');
    }

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();