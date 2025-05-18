const { Events, InteractionType } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // --- BEGIN: Wizard modal handlers ---
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'ride-wizard-date-modal') {
      if (!interaction.client.rideWizardData) interaction.client.rideWizardData = new Map();
      const userData = interaction.client.rideWizardData.get(interaction.user.id) || {};
      userData.date = interaction.fields.getTextInputValue('rideWizardDate');
      interaction.client.rideWizardData.set(interaction.user.id, userData);
      // Immediately show the meet time modal
      const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
      const modal = new ModalBuilder()
        .setCustomId('ride-wizard-meet-time-modal')
        .setTitle('Enter Meet Time');
      const timeInput = new TextInputBuilder()
        .setCustomId('rideWizardMeetTime')
        .setLabel('Meet Time (e.g., 9:00 AM)')
        .setPlaceholder('e.g., 9:00 AM')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      modal.addComponents(new ActionRowBuilder().addComponents(timeInput));
      await interaction.showModal(modal);
      return;
    }
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'ride-wizard-meet-time-modal') {
      if (!interaction.client.rideWizardData) interaction.client.rideWizardData = new Map();
      const userData = interaction.client.rideWizardData.get(interaction.user.id) || {};
      userData.meetTime = interaction.fields.getTextInputValue('rideWizardMeetTime');
      interaction.client.rideWizardData.set(interaction.user.id, userData);
      // Auto-proceed to rollout time
      const config = require('../config/config');
      const rolloutOptions = config.defaultOptions.rolloutTimeOptions.map(opt => ({ label: opt.label, value: opt.label }));
      const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
      const rolloutSelect = new StringSelectMenuBuilder()
        .setCustomId('ride-wizard-rollout')
        .setPlaceholder('Select rollout time')
        .addOptions(rolloutOptions);
      const row = new ActionRowBuilder().addComponents(rolloutSelect);
      await interaction.reply({
        content: 'Step 6: Select rollout time.',
        components: [row],
        ephemeral: true
      });
      return;
    }
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'ride-wizard-custom-start-location') {
      if (!interaction.client.rideWizardData) interaction.client.rideWizardData = new Map();
      const userData = interaction.client.rideWizardData.get(interaction.user.id) || {};
      userData.startLocation = {
        name: interaction.fields.getTextInputValue('customStartLocationName'),
        url: interaction.fields.getTextInputValue('customStartLocationUrl') || null
      };
      interaction.client.rideWizardData.set(interaction.user.id, userData);
      // Auto-proceed to end location
      const config = require('../config/config');
      const endLocationOptions = config.defaultOptions.endLocations.map(loc => ({ label: loc.name, value: loc.name }));
      endLocationOptions.push({ label: 'Same as start', value: 'Same as start' });
      endLocationOptions.push({ label: 'Other', value: 'Other' });
      const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
      const endLocSelect = new StringSelectMenuBuilder()
        .setCustomId('ride-wizard-end-location')
        .setPlaceholder('Select end location')
        .addOptions(endLocationOptions);
      const row = new ActionRowBuilder().addComponents(endLocSelect);
      await interaction.reply({
        content: 'Step 8: Select end location.',
        components: [row],
        ephemeral: true
      });
      return;
    }
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'ride-wizard-custom-end-location') {
      if (!interaction.client.rideWizardData) interaction.client.rideWizardData = new Map();
      const userData = interaction.client.rideWizardData.get(interaction.user.id) || {};
      userData.endLocation = {
        name: interaction.fields.getTextInputValue('customEndLocationName'),
        url: interaction.fields.getTextInputValue('customEndLocationUrl') || null
      };
      interaction.client.rideWizardData.set(interaction.user.id, userData);
      // Auto-proceed to distance input
      const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
      const modal = new ModalBuilder()
        .setCustomId('ride-wizard-distance-modal')
        .setTitle('Enter Distance (optional)');
      const distanceInput = new TextInputBuilder()
        .setCustomId('rideWizardDistance')
        .setLabel('Distance (optional, e.g., 25 miles or 40 km)')
        .setPlaceholder('e.g., 25 miles or 40 km')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);
      modal.addComponents(new ActionRowBuilder().addComponents(distanceInput));
      await interaction.showModal(modal);
      return;
    }
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'ride-wizard-distance-modal') {
      if (!interaction.client.rideWizardData) interaction.client.rideWizardData = new Map();
      const userData = interaction.client.rideWizardData.get(interaction.user.id) || {};
      userData.distance = interaction.fields.getTextInputValue('rideWizardDistance');
      interaction.client.rideWizardData.set(interaction.user.id, userData);
      // Auto-proceed to route input
      const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
      const modal = new ModalBuilder()
        .setCustomId('ride-wizard-route-modal')
        .setTitle('Enter Route Link (optional)');
      const routeInput = new TextInputBuilder()
        .setCustomId('rideWizardRoute')
        .setLabel('Route Link (optional)')
        .setPlaceholder('e.g., Strava or RideWithGPS link')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);
      modal.addComponents(new ActionRowBuilder().addComponents(routeInput));
      await interaction.showModal(modal);
      return;
    }
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'ride-wizard-route-modal') {
      if (!interaction.client.rideWizardData) interaction.client.rideWizardData = new Map();
      const userData = interaction.client.rideWizardData.get(interaction.user.id) || {};
      userData.routeSource = interaction.fields.getTextInputValue('rideWizardRoute');
      interaction.client.rideWizardData.set(interaction.user.id, userData);
      // Auto-proceed to notes input
      const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
      const modal = new ModalBuilder()
        .setCustomId('ride-wizard-notes-modal')
        .setTitle('Enter Notes (optional)');
      const notesInput = new TextInputBuilder()
        .setCustomId('rideWizardNotes')
        .setLabel('Notes (optional, max 1000 chars)')
        .setPlaceholder('Any additional notes for the ride')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setMaxLength(1000);
      modal.addComponents(new ActionRowBuilder().addComponents(notesInput));
      await interaction.showModal(modal);
      return;
    }
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'ride-wizard-notes-modal') {
      if (!interaction.client.rideWizardData) interaction.client.rideWizardData = new Map();
      const userData = interaction.client.rideWizardData.get(interaction.user.id) || {};
      userData.notes = interaction.fields.getTextInputValue('rideWizardNotes');
      interaction.client.rideWizardData.set(interaction.user.id, userData);
      // Show summary and confirm
      const summary = `**Type:** ${userData.type}\n**Vibe:** ${userData.vibe}\n**Drop Style:** ${userData.dropStyle}\n**Date:** ${userData.date}\n**Meet Time:** ${userData.meetTime}\n**Rollout Time:** ${userData.rolloutTime}\n**Start Location:** ${typeof userData.startLocation === 'object' ? userData.startLocation.name : userData.startLocation}\n**End Location:** ${typeof userData.endLocation === 'object' ? userData.endLocation.name : userData.endLocation}\n**Distance:** ${userData.distance || 'N/A'}\n**Route:** ${userData.routeSource || 'N/A'}\n**Notes:** ${userData.notes || 'N/A'}`;
      const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
      const confirmButton = new ButtonBuilder()
        .setCustomId('ride-wizard-confirm')
        .setLabel('Confirm and Post Ride')
        .setStyle(ButtonStyle.Success);
      const cancelButton = new ButtonBuilder()
        .setCustomId('ride-wizard-cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);
      await interaction.reply({
        content: `**Ride Summary:**\n${summary}`,
        components: [row],
        ephemeral: true
      });
      return;
    }
    // --- END: Wizard modal handlers ---
    
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'There was an error executing this command!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
        }
      }
    }
    
    // Handle context menu commands
    else if (interaction.isUserContextMenuCommand()) {
      const contextMenu = interaction.client.contextMenus.get(interaction.commandName);
      
      if (!contextMenu) {
        console.error(`No context menu matching ${interaction.commandName} was found.`);
        return;
      }
      
      try {
        await contextMenu.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'There was an error executing this context menu!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'There was an error executing this context menu!', ephemeral: true });
        }
      }
    }
    
    // Handle modals
    else if (interaction.type === InteractionType.ModalSubmit) {
      // The modal handlers will be defined in their respective command files
      // We'll extract the command name from the customId which will be in format: commandName-action
      const [commandName] = interaction.customId.split('-');
      const command = interaction.client.commands.get(commandName);
      
      if (!command || !command.handleModal) {
        console.error(`No modal handler found for ${interaction.customId}`);
        return;
      }
      
      try {
        await command.handleModal(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'There was an error processing your submission!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'There was an error processing your submission!', ephemeral: true });
        }
      }
    }
    
    // Handle select menu and button interactions for the ride wizard
    if (interaction.isStringSelectMenu() && interaction.customId === 'ride-wizard-type') {
      if (!interaction.client.rideWizardData) interaction.client.rideWizardData = new Map();
      const userData = interaction.client.rideWizardData.get(interaction.user.id) || {};
      userData.type = interaction.values[0];
      interaction.client.rideWizardData.set(interaction.user.id, userData);
      // Auto-proceed to vibe selection
      const config = require('../config/config');
      const vibeOptions = Object.keys(config.rideVibes).map(vibe => ({ label: vibe, value: vibe }));
      const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
      const vibeSelect = new StringSelectMenuBuilder()
        .setCustomId('ride-wizard-vibe')
        .setPlaceholder('Select ride vibe')
        .addOptions(vibeOptions);
      const row = new ActionRowBuilder().addComponents(vibeSelect);
      await interaction.reply({
        content: 'Step 2: What vibe is the ride?',
        components: [row],
        ephemeral: true
      });
      return;
    }
    if (interaction.isStringSelectMenu() && interaction.customId === 'ride-wizard-vibe') {
      if (!interaction.client.rideWizardData) interaction.client.rideWizardData = new Map();
      const userData = interaction.client.rideWizardData.get(interaction.user.id) || {};
      userData.vibe = interaction.values[0];
      interaction.client.rideWizardData.set(interaction.user.id, userData);
      // Auto-proceed to drop style
      const config = require('../config/config');
      const dropStyleOptions = config.dropStyles.map(style => ({ label: style, value: style }));
      const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
      const dropStyleSelect = new StringSelectMenuBuilder()
        .setCustomId('ride-wizard-drop-style')
        .setPlaceholder('Select drop style')
        .addOptions(dropStyleOptions);
      const row = new ActionRowBuilder().addComponents(dropStyleSelect);
      await interaction.reply({
        content: 'Step 3: What is the drop style?',
        components: [row],
        ephemeral: true
      });
      return;
    }
    if (interaction.isStringSelectMenu() && interaction.customId === 'ride-wizard-drop-style') {
      if (!interaction.client.rideWizardData) interaction.client.rideWizardData = new Map();
      const userData = interaction.client.rideWizardData.get(interaction.user.id) || {};
      userData.dropStyle = interaction.values[0];
      interaction.client.rideWizardData.set(interaction.user.id, userData);
      // Auto-proceed to date input
      const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
      const modal = new ModalBuilder()
        .setCustomId('ride-wizard-date-modal')
        .setTitle('Enter Ride Date');
      const dateInput = new TextInputBuilder()
        .setCustomId('rideWizardDate')
        .setLabel('Date (MM/DD or natural language)')
        .setPlaceholder('e.g., 05/15 or next Tuesday')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      modal.addComponents(new ActionRowBuilder().addComponents(dateInput));
      await interaction.showModal(modal);
      return;
    }
    if (interaction.isStringSelectMenu() && interaction.customId === 'ride-wizard-rollout') {
      if (!interaction.client.rideWizardData) interaction.client.rideWizardData = new Map();
      const userData = interaction.client.rideWizardData.get(interaction.user.id) || {};
      userData.rolloutTime = interaction.values[0];
      interaction.client.rideWizardData.set(interaction.user.id, userData);
      // Auto-proceed to start location
      const config = require('../config/config');
      const locationOptions = config.defaultOptions.locations.map(loc => ({ label: loc.name, value: loc.name }));
      locationOptions.push({ label: 'Other', value: 'Other' });
      const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
      const startLocSelect = new StringSelectMenuBuilder()
        .setCustomId('ride-wizard-start-location')
        .setPlaceholder('Select start location')
        .addOptions(locationOptions);
      const row = new ActionRowBuilder().addComponents(startLocSelect);
      await interaction.reply({
        content: 'Step 7: Select start location.',
        components: [row],
        ephemeral: true
      });
      return;
    }
    if (interaction.isStringSelectMenu() && interaction.customId === 'ride-wizard-start-location') {
      if (!interaction.client.rideWizardData) interaction.client.rideWizardData = new Map();
      const userData = interaction.client.rideWizardData.get(interaction.user.id) || {};
      userData.startLocation = interaction.values[0];
      interaction.client.rideWizardData.set(interaction.user.id, userData);
      if (userData.startLocation === 'Other') {
        // Show modal for custom start location
        const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
        const modal = new ModalBuilder()
          .setCustomId('ride-wizard-custom-start-location')
          .setTitle('Enter Custom Start Location');
        const nameInput = new TextInputBuilder()
          .setCustomId('customStartLocationName')
          .setLabel('Location Name')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);
        const urlInput = new TextInputBuilder()
          .setCustomId('customStartLocationUrl')
          .setLabel('Google Maps URL (optional)')
          .setStyle(TextInputStyle.Short)
          .setRequired(false);
        modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(urlInput));
        await interaction.showModal(modal);
        return;
      }
      // Auto-proceed to end location
      const config = require('../config/config');
      const endLocationOptions = config.defaultOptions.endLocations.map(loc => ({ label: loc.name, value: loc.name }));
      endLocationOptions.push({ label: 'Same as start', value: 'Same as start' });
      endLocationOptions.push({ label: 'Other', value: 'Other' });
      const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
      const endLocSelect = new StringSelectMenuBuilder()
        .setCustomId('ride-wizard-end-location')
        .setPlaceholder('Select end location')
        .addOptions(endLocationOptions);
      const row = new ActionRowBuilder().addComponents(endLocSelect);
      await interaction.reply({
        content: 'Step 8: Select end location.',
        components: [row],
        ephemeral: true
      });
      return;
    }
    if (interaction.isStringSelectMenu() && interaction.customId === 'ride-wizard-end-location') {
      if (!interaction.client.rideWizardData) interaction.client.rideWizardData = new Map();
      const userData = interaction.client.rideWizardData.get(interaction.user.id) || {};
      userData.endLocation = interaction.values[0];
      interaction.client.rideWizardData.set(interaction.user.id, userData);
      if (userData.endLocation === 'Other') {
        // Show modal for custom end location
        const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
        const modal = new ModalBuilder()
          .setCustomId('ride-wizard-custom-end-location')
          .setTitle('Enter Custom End Location');
        const nameInput = new TextInputBuilder()
          .setCustomId('customEndLocationName')
          .setLabel('Location Name')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);
        const urlInput = new TextInputBuilder()
          .setCustomId('customEndLocationUrl')
          .setLabel('Google Maps URL (optional)')
          .setStyle(TextInputStyle.Short)
          .setRequired(false);
        modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(urlInput));
        await interaction.showModal(modal);
        return;
      }
      // Auto-proceed to distance input
      const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
      const modal = new ModalBuilder()
        .setCustomId('ride-wizard-distance-modal')
        .setTitle('Enter Distance (optional)');
      const distanceInput = new TextInputBuilder()
        .setCustomId('rideWizardDistance')
        .setLabel('Distance (optional, e.g., 25 miles or 40 km)')
        .setPlaceholder('e.g., 25 miles or 40 km')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);
      modal.addComponents(new ActionRowBuilder().addComponents(distanceInput));
      await interaction.showModal(modal);
      return;
    }
    if (interaction.isButton() && interaction.customId === 'ride-wizard-confirm') {
      const userData = interaction.client.rideWizardData?.get(interaction.user.id);
      if (!userData) {
        await interaction.reply({ content: 'Something went wrong. Please start over.', ephemeral: true });
        return;
      }
      // Build rideData for embed
      const config = require('../config/config');
      let startLocation = userData.startLocation;
      if (typeof startLocation === 'string' && startLocation !== 'Other') {
        startLocation = config.defaultOptions.locations.find(loc => loc.name === startLocation);
      }
      let endLocation = userData.endLocation;
      if (typeof endLocation === 'string' && endLocation !== 'Other' && endLocation !== 'Same as start') {
        endLocation = config.defaultOptions.endLocations.find(loc => loc.name === endLocation);
      } else if (endLocation === 'Same as start') {
        endLocation = null;
      }
      const rideData = {
        type: userData.type,
        vibe: userData.vibe,
        dropStyle: userData.dropStyle,
        date: userData.date,
        meetTime: userData.meetTime,
        rolloutTime: userData.rolloutTime,
        startLocation,
        endLocation,
        distance: userData.distance,
        routeSource: userData.routeSource,
        notes: userData.notes,
        creatorId: interaction.user.id
      };
      const { createRideEmbed, saveRide } = require('../utils/rideUtils');
      const embed = createRideEmbed(rideData, interaction.user);
      const channelId = config.rideTypes[rideData.type].channelId;
      const channel = interaction.guild.channels.cache.get(channelId);
      if (!channel) {
        await interaction.reply({ content: `Error: Channel for ${rideData.type} not found. Please check the channelId in config.js`, ephemeral: true });
        return;
      }
      const message = await channel.send({ embeds: [embed] });
      const rideTypeEmoji = config.rideTypes[rideData.type].emoji;
      await message.react(rideTypeEmoji);
      await saveRide(rideData, message.id, channel.id, interaction.client);
      await interaction.reply({ content: `Your ${rideData.vibe} ${rideData.type} ride has been posted in the <#${channel.id}> channel!`, ephemeral: true });
      interaction.client.rideWizardData.delete(interaction.user.id);
      return;
    }
    if (interaction.isButton() && interaction.customId === 'ride-wizard-cancel') {
      interaction.client.rideWizardData.delete(interaction.user.id);
      await interaction.reply({ content: 'Ride creation canceled.', ephemeral: true });
      return;
    }
  },
};