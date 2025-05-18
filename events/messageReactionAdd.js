const { Events } = require('discord.js');
const config = require('../config/config');
const { updateRideParticipants } = require('../utils/rideUtils');

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(reaction, user) {
    // Don't process reactions from bots
    if (user.bot) return;
    
    // When we receive a reaction we check if the reaction is partial
    if (reaction.partial) {
      // If the message this reaction belongs to was removed, the fetching might result in an error
      try {
        await reaction.fetch();
      } catch (error) {
        console.error('Something went wrong when fetching the message:', error);
        return;
      }
    }
    
    // Check if this is a ride announcement message (we'll identify these later)
    // For now, we'll use a simple check: does the message contain "RIDE" in the title
    const message = reaction.message;
    
    if (message.embeds.length === 0) return;
    
    const embed = message.embeds[0];
    if (!embed.title || !embed.title.includes('RIDE')) return;
    
    // Get the ride type from the title to determine the expected emoji
    let foundType = null;
    
    for (const [type, details] of Object.entries(config.rideTypes)) {
      if (embed.title.includes(type)) {
        foundType = type;
        break;
      }
    }
    
    if (!foundType) return;
    
    const expectedEmoji = config.rideTypes[foundType].emoji;
    
    // Check if the reaction matches the expected emoji for this ride type
    if (reaction.emoji.name === expectedEmoji) {
      // Handle participant joining
      try {
        await updateRideParticipants(message, user, 'add');
      } catch (error) {
        console.error('Error updating ride participants:', error);
      }
    }
  },
};