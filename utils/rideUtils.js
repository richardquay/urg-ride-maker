/**
 * Utility functions for ride creation and management
 */
const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');
const fs = require('fs');
const path = require('path');
const { scheduleRideNotifications } = require('./notificationUtils');
const chrono = require('chrono-node');
const { ModalSubmitInteraction } = require('discord.js');
const { getWeatherForecast, formatWeatherEmbed } = require('./weatherUtils');
require('dotenv').config();

// Data file path for storing rides (simple JSON approach for MVP)
const dataPath = path.join(__dirname, '..', 'data', 'rides.json');

// Process the optional distance field, converting to miles if needed
function processDistance(distanceInput) {
  if (!distanceInput) return null;
  
  const distanceStr = distanceInput.toString().trim().toLowerCase();
  
  // Check if distance contains "km" or "kilometers"
  if (distanceStr.includes('km') || distanceStr.includes('kilometer')) {
    // Extract the numeric part
    const numMatch = distanceStr.match(/([0-9.]+)/);
    if (!numMatch) return null;
    
    const kilometers = parseFloat(numMatch[1]);
    const miles = kilometers * 0.621371;
    
    // Round to one decimal place
    return `${miles.toFixed(1)} miles`;
  }
  
  // If already in miles or no unit specified
  const numMatch = distanceStr.match(/([0-9.]+)/);
  if (!numMatch) return null;
  
  const distance = parseFloat(numMatch[1]);
  return `${distance.toFixed(1)} miles`;
}

// Create a formatted embed for a ride announcement
async function createRideEmbed(rideData, creator) {
  const { vibe, type, dropStyle, date, meetTime, rolloutTime, startLocation, endLocation, distance, routeSource, avgMph } = rideData;
  const vibeDetails = config.rideVibes[vibe];
  const typeDetails = config.rideTypes[type];

  // Set color based on day of week
  const dayColors = {
    0: 0xFFA500, // Sunday - Orange
    1: 0x3498DB, // Monday - Blue
    2: 0x2ECC71, // Tuesday - Green
    3: 0x9B59B6, // Wednesday - Purple
    4: 0xF1C40F, // Thursday - Yellow
    5: 0xA0522D, // Friday - Brown
    6: 0xE74C3C, // Saturday - Red
  };
  let color = 0x95a5a6; // Default gray
  const parsedDate = new Date(date);
  if (!isNaN(parsedDate.getTime())) {
    const dayOfWeek = parsedDate.getDay();
    color = dayColors[dayOfWeek] || color;
  }

  // Build the main description
  let description = `\n\n**Date:** ${date}\n`;
  description += `**Meet time:** ${meetTime} - Roll out: ${rolloutTime}\n`;
  description += `\n**Type:** ${type}`;
  description += `\n**Vibe:** ${vibe}`;
  description += `\n**Drop:** ${dropStyle}`;
  if (avgMph) {
    description += `\n**Avg MPH:** ${avgMph} mph`;
  }
  description += `\n`;
  // Start location: link if url, plain text if not
  if (startLocation?.name) {
    if (startLocation.url) {
      description += `\n**Start location:** [${startLocation.name}](${startLocation.url})`;
    } else {
      description += `\n**Start location:** ${startLocation.name}`;
    }
  } else {
    description += `\n**Start location:** N/A`;
  }
  // End location: link if url, plain text if not
  if (endLocation && endLocation.name && endLocation.name !== 'Same as start') {
    if (endLocation.url) {
      description += `\n**End location:** [${endLocation.name}](${endLocation.url})`;
    } else {
      description += `\n**End location:** ${endLocation.name}`;
    }
  }
  // Add carriage return before ride leader
  description += `\n`;
  // Notes field before ride leader
  if (rideData.notes) {
    description += `\n**Notes:** ${rideData.notes}`;
    description += `\n\n`;
  }
  description += `**Ride leader:** <@${creator.id}>`;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${vibeDetails.emoji} ${vibe.toUpperCase()} ${type.toUpperCase()} RIDE`)
    .setDescription(description)
    .setFooter({
      text: `${typeDetails.emoji} React if you're interested in joining!`
    })
    .setTimestamp();

  // Optionally add distance and route as separate fields if present
  if (distance) {
    embed.addFields({ name: 'Distance', value: distance, inline: true });
  }
  if (routeSource) {
    embed.addFields({ name: 'Route', value: routeSource, inline: true });
  }

  // Add weather forecast if the ride is within 72 hours
  const rideDate = new Date(date);
  const now = new Date();
  const hoursUntilRide = (rideDate - now) / (1000 * 60 * 60);
  
  if (hoursUntilRide > 0 && hoursUntilRide <= 72 && startLocation?.coordinates) {
    const weatherData = await getWeatherForecast(
      startLocation.coordinates.latitude,
      startLocation.coordinates.longitude,
      date
    );
    
    if (weatherData) {
      const weatherField = formatWeatherEmbed(weatherData);
      if (weatherField) {
        embed.addFields(weatherField);
      }
    }
  }

  return embed;
}

// Save ride data
async function saveRide(rideData, messageId, channelId, client) {
  try {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(path.dirname(dataPath))) {
      fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    }
    
    // Load existing rides
    let rides = [];
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      rides = JSON.parse(data);
    }
    
    // Add the new ride with message reference
    const newRide = {
      ...rideData,
      messageId,
      channelId,
      participants: [],
      createdAt: new Date().toISOString()
    };
    
    rides.push(newRide);
    
    // Save back to file
    fs.writeFileSync(dataPath, JSON.stringify(rides, null, 2));
    
    // Schedule notifications for this ride
    if (client) {
      console.log('Ride date:', rideData.date);
      const rideDate = new Date(rideData.date);
      if (isNaN(rideDate.getTime())) {
        // Handle invalid date (show error, skip scheduling, etc.)
      }
      scheduleRideNotifications(client, newRide, messageId, channelId);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving ride:', error);
    return false;
  }
}

// Update ride participants
async function updateRideParticipants(message, user, action) {
  try {
    // Load existing rides
    if (!fs.existsSync(dataPath)) {
      return false;
    }
    
    const data = fs.readFileSync(dataPath, 'utf8');
    let rides = JSON.parse(data);
    
    // Find the ride by message ID
    const rideIndex = rides.findIndex(ride => ride.messageId === message.id);
    if (rideIndex === -1) return false;
    
    const ride = rides[rideIndex];
    
    // Add or remove participant
    if (action === 'add') {
      // Check if user is already in participants
      if (!ride.participants.some(p => p.id === user.id)) {
        ride.participants.push({
          id: user.id,
          username: user.username,
          joinedAt: new Date().toISOString()
        });
      }
    } else if (action === 'remove') {
      ride.participants = ride.participants.filter(p => p.id !== user.id);
    }
    
    // Save the updated ride data
    rides[rideIndex] = ride;
    fs.writeFileSync(dataPath, JSON.stringify(rides, null, 2));
    
    // Update the embed to show participants
    const embed = EmbedBuilder.from(message.embeds[0]);
    
    // Remove existing participants field if it exists
    let fields = embed.data.fields || [];
    fields = fields.filter(field => field.name !== 'Participants');
    
    // Add updated participants field
    if (ride.participants.length > 0) {
      const participantsList = ride.participants
        .map(p => `<@${p.id}>`)
        .join(', ');
      
      fields.push({
        name: 'Participants',
        value: `${participantsList} (${ride.participants.length})`,
        inline: false
      });
    }
    
    embed.setFields(fields);
    
    // Update the message with the new embed
    await message.edit({ embeds: [embed] });
    
    return true;
  } catch (error) {
    console.error('Error updating ride participants:', error);
    return false;
  }
}

module.exports = {
  processDistance,
  createRideEmbed,
  saveRide,
  updateRideParticipants
};