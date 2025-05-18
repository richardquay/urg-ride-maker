const { ContextMenuCommandBuilder, ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('Create Ride')
    .setType(ApplicationCommandType.User),
  
  async execute(interaction) {
    // The context menu command provides the same form as the /create-ride-form command
    // Create the modal
    const modal = new ModalBuilder()
      .setCustomId('create-ride-form-main')
      .setTitle('Create a New Ride');
    
    // Add inputs to the modal
    
    // Vibe selection (required)
    const vibeInput = new TextInputBuilder()
      .setCustomId('vibe')
      .setLabel('Vibe (Spicy or Party)')
      .setPlaceholder('Spicy or Party')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    
    // Type selection (required)
    const typeInput = new TextInputBuilder()
      .setCustomId('type')
      .setLabel('Type (Road, Gravel, Mountain, Social, Virtual)')
      .setPlaceholder('Road, Gravel, Mountain, Social, Virtual')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    
    // Drop style (required)
    const dropStyleInput = new TextInputBuilder()
      .setCustomId('dropStyle')
      .setLabel('Drop Style (Drop, No Drop, Regroup)')
      .setPlaceholder('Drop, No Drop, Regroup')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    
    // Date (required)
    const dateInput = new TextInputBuilder()
      .setCustomId('date')
      .setLabel('Date (MM/DD)')
      .setPlaceholder('e.g., 05/15')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    
    // Meet Time (required)
    const meetTimeInput = new TextInputBuilder()
      .setCustomId('meetTime')
      .setLabel('Meet Time (e.g., 9:00 AM)')
      .setPlaceholder('e.g., 9:00 AM')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    
    // Add inputs to action rows (Discord requires one action row per text input)
    const vibeRow = new ActionRowBuilder().addComponents(vibeInput);
    const typeRow = new ActionRowBuilder().addComponents(typeInput);
    const dropStyleRow = new ActionRowBuilder().addComponents(dropStyleInput);
    const dateRow = new ActionRowBuilder().addComponents(dateInput);
    const meetTimeRow = new ActionRowBuilder().addComponents(meetTimeInput);
    
    // Add action rows to the modal
    modal.addComponents(vibeRow, typeRow, dropStyleRow, dateRow, meetTimeRow);
    
    // Show the modal to the user
    await interaction.showModal(modal);
    
    // Note: The modal submission will be handled by the createRideForm command's handleModal method
  }
};