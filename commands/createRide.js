const { SlashCommandBuilder } = require('discord.js');
const config = require('../config/config');
const { formatDate, parseTime, calculateRolloutTime, getRolloutIncrementMinutes } = require('../utils/dateUtils');
const { processDistance, createRideEmbed, saveRide } = require('../utils/rideUtils');
const { parseFuzzyDate } = require('../utils/dateParser');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-ride')
    .setDescription('Create a new group ride')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of ride')
        .setRequired(true)
        .addChoices(
          { name: 'Road', value: 'Road' },
          { name: 'Gravel', value: 'Gravel' },
          { name: 'Mountain', value: 'Mountain' },
          { name: 'Social', value: 'Social' },
          { name: 'Virtual', value: 'Virtual' },
          { name: 'Race', value: 'Race' }
        ))
    .addStringOption(option =>
      option.setName('vibe')
        .setDescription('Vibe of the ride')
        .setRequired(true)
        .addChoices(
          { name: '🌶️ Spicy', value: 'Spicy' },
          { name: '🎉 Party', value: 'Party' }
        ))
    .addStringOption(option =>
      option.setName('drop_style')
        .setDescription('Drop style of the ride')
        .setRequired(true)
        .addChoices(
          { name: 'Drop', value: 'Drop' },
          { name: 'No Drop', value: 'No Drop' },
          { name: 'Regroup', value: 'Regroup' }
        ))
    .addStringOption(option =>
      option.setName('date')
      .setDescription('When is the ride? (MM/DD, month name, or "today"/"tomorrow")')
      .setRequired(true))
    .addStringOption(option =>
      option.setName('time')
        .setDescription('Meet time (e.g., 9:00 AM)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('rollout_time')
        .setDescription('Time when the ride starts moving')
        .addChoices(
          { name: 'Same time', value: 'Same time' },
          { name: '+15 mins', value: '+15 mins' },
          { name: '+30 mins', value: '+30 mins' },
          { name: '+45 mins', value: '+45 mins' },
          { name: '+60 mins', value: '+60 mins' }
        ))
    .addStringOption(option =>
      option.setName('start_location')
        .setDescription('Starting location')
        .addChoices(
          { name: '🐟 Angry Catfish', value: 'Angry Catfish' },
          { name: '☕ Northern Coffeeworks', value: 'Northern Coffeeworks' },
          { name: '🏠 Park\'s House', value: 'Park\'s House' },
          { name: '📍 Other Location', value: 'Other' }
        ))
    .addStringOption(option =>
      option.setName('end_location')
        .setDescription('Ending location')
        .addChoices(
          { name: 'Same as start', value: 'Same as start' },
          { name: '🍺 Venn Brewery', value: 'Venn Brewery' },
          { name: '🐂 Bulls Horn', value: 'Bulls Horn' },
          { name: '🌊 Sea Salt', value: 'Sea Salt' },
          { name: '🏖️ Dada\'s Beach', value: 'Dada\'s Beach' },
          { name: '📍 Other Location', value: 'Other' }
        ))
    .addStringOption(option =>
      option.setName('distance')
        .setDescription('Ride distance (optional, e.g., 25 miles or 40 km)'))
    .addStringOption(option =>
      option.setName('avg_speed')
        .setDescription('Average speed in mph (optional)'))
    .addStringOption(option =>
      option.setName('route_source')
        .setDescription('Link to route (optional)'))
    .addStringOption(option =>
      option.setName('notes')
        .setDescription('Additional notes (optional, max 1000 characters)')
        .setMaxLength(1000)
        .setRequired(false)),
  
  async execute(interaction) {
    // Get all the option values
    const type = interaction.options.getString('type');
    const vibe = interaction.options.getString('vibe');
    const dropStyleInput = interaction.options.getString('drop_style');
    const dateInput = interaction.options.getString('date');
    const timeInputRaw = interaction.options.getString('time');
    const rolloutTimeInput = interaction.options.getString('rollout_time') || '+15 mins';
    const startLocationInput = interaction.options.getString('start_location') || 'Angry Catfish';
    const endLocationInput = interaction.options.getString('end_location') || 'Venn Brewery';
    const distanceInput = interaction.options.getString('distance');
    const avgSpeedInput = interaction.options.getString('avg_speed');
    const routeSourceInput = interaction.options.getString('route_source');
    const notesInput = interaction.options.getString('notes');
    const parsedDate = parseFuzzyDate(dateInput);
    
    // Auto-convert 'noon' and 'midnight' to standard times
    let timeInput = timeInputRaw.trim().toLowerCase();
    if (timeInput === 'noon') timeInput = '12:00 PM';
    else if (timeInput === 'midnight') timeInput = '12:00 AM';
    
    // If user selects 'Other' for start or end location, show a modal
    if (startLocationInput === 'Other' || endLocationInput === 'Other') {
      const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
      const modal = new ModalBuilder()
        .setCustomId('custom-location-modal')
        .setTitle('Enter Custom Location');

      const nameInput = new TextInputBuilder()
        .setCustomId('customLocationName')
        .setLabel('Location Name')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const urlInput = new TextInputBuilder()
        .setCustomId('customLocationUrl')
        .setLabel('Google Maps URL (optional)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      const nameRow = new ActionRowBuilder().addComponents(nameInput);
      const urlRow = new ActionRowBuilder().addComponents(urlInput);
      modal.addComponents(nameRow, urlRow);

      // Store partial ride data and which location is being set
      if (!interaction.client.partialRideData) {
        interaction.client.partialRideData = new Map();
      }
      interaction.client.partialRideData.set(interaction.user.id, {
        type,
        vibe,
        dropStyleInput,
        dateInput,
        timeInput,
        rolloutTimeInput,
        distanceInput,
        routeSourceInput,
        customLocationType: startLocationInput === 'Other' ? 'start' : 'end',
        // Also store the non-custom location if needed
        startLocationInput,
        endLocationInput
      });

      await interaction.showModal(modal);
      return;
    }
    
    // Validate inputs
    
    // Check if type is admin-only
    const isTypeAdminOnly = config.rideTypes[type].adminOnly;
    const isAdmin = interaction.member.permissions.has('ADMINISTRATOR') || 
                     interaction.member.permissions.has('MANAGE_CHANNELS');
    
    if (isTypeAdminOnly && !isAdmin) {
      return await interaction.reply({
        content: `Only administrators can create ${type} rides.`,
        ephemeral: true
      });
    }
    
    // Apply the Party vibe business rule
    let dropStyle = dropStyleInput;
    if (vibe === 'Party' && dropStyle !== 'No Drop') {
      dropStyle = 'No Drop';
    }
    
    // Parse and format the date
let formattedDate;
try {
  // Use the new fuzzy date parser function
  const parsedDateResult = parseFuzzyDate(dateInput);
  
  // Check if parsing was successful
  if (!parsedDateResult.success) {
    return await interaction.reply({
      content: parsedDateResult.error,
      ephemeral: true
    });
  }
  
  // If successful, use the formatted date
  formattedDate = parsedDateResult.date;
} catch (error) {
  console.error('Date parsing error:', error);
  return await interaction.reply({
    content: 'Invalid date format. Please use MM/DD format, month name (May 15), or words like "today" or "tomorrow".',
    ephemeral: true
  });
}
    
    // Parse and format the meet time
    let formattedMeetTime;
    try {
      formattedMeetTime = parseTime(timeInput);
    } catch (error) {
      return await interaction.reply({
        content: 'Invalid time format. Please use formats like "9:00 AM" or "14:00".',
        ephemeral: true
      });
    }
    
    // Process rollout time
    const incrementMinutes = getRolloutIncrementMinutes(rolloutTimeInput);
    const rolloutTime = calculateRolloutTime(formattedMeetTime, incrementMinutes);
    
    // Process start location
    let startLocation;
    if (startLocationInput && startLocationInput !== 'Other') {
      startLocation = config.defaultOptions.locations.find(loc => loc.name === startLocationInput);
    } else {
      // Default to the first location in the config
      startLocation = config.defaultOptions.locations[0];
    }
    
    // Process end location
    let endLocation = null;
    if (endLocationInput !== 'Same as start') {
      if (endLocationInput === 'Venn Brewery') {
        endLocation = config.defaultOptions.endLocations.find(loc => loc.name === 'Venn Brewery');
      } else if (endLocationInput === 'Bulls Horn') {
        endLocation = config.defaultOptions.endLocations.find(loc => loc.name === 'Bulls Horn');
      } else if (endLocationInput === 'Sea Salt') {
        endLocation = config.defaultOptions.endLocations.find(loc => loc.name === 'Sea Salt');
      }
    }
    
    // Process distance
    const processedDistance = distanceInput ? processDistance(distanceInput) : null;
    
    // Combine all data
    const rideData = {
      vibe,
      type,
      dropStyle,
      date: formattedDate,
      meetTime: formattedMeetTime,
      rolloutTime,
      startLocation,
      endLocation,
      distance: processedDistance,
      avgMph: avgSpeedInput,
      routeSource: routeSourceInput,
      notes: notesInput,
      creatorId: interaction.user.id
    };
    
    // Get the channel based on ride type
    const channelId = config.rideTypes[type].channelId;
    const channel = interaction.guild.channels.cache.get(channelId);
    
    if (!channel) {
      return await interaction.reply({
        content: `Error: Channel for ${type} not found. Please check the channelId in config.js`,
        ephemeral: true
      });
    }
    
    // Defer the reply since posting to channels might take a moment
    await interaction.deferReply({ ephemeral: true });
    
    // Defensive checks for locations
    if (!startLocation || !startLocation.name) {
      await interaction.editReply({
        content: 'Start location is missing or invalid. Please check your input.',
        ephemeral: true
      });
      return;
    }
    if (endLocationInput !== 'Same as start' && endLocation && !endLocation.name) {
      await interaction.editReply({
        content: 'End location is missing or invalid. Please check your input.',
        ephemeral: true
      });
      return;
    }
    
    // Create and send the embed
    try {
      console.log('startLocation:', startLocation);
      console.log('endLocation:', endLocation);
      const embed = createRideEmbed(rideData, interaction.user);
      const message = await channel.send({ embeds: [embed] });
      
      // Add the appropriate reaction
      const rideTypeEmoji = config.rideTypes[type].emoji;
      await message.react(rideTypeEmoji);
      
      // Save the ride data
      await saveRide(rideData, message.id, channel.id, interaction.client);
      
      // Confirm to the user
      await interaction.editReply({
        content: `Your ${vibe} ${type} ride has been posted in the <#${channel.id}> channel!`,
        ephemeral: true
      });
    } catch (error) {
      console.error('Error creating ride:', error);
      await interaction.editReply({
        content: 'There was an error creating your ride. Please try again.',
        ephemeral: true
      });
    }
  }
};