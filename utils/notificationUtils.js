/**
 * Utility functions for handling notifications and reminders
 */
const { EmbedBuilder } = require('discord.js');
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');

// Data file path
const dataPath = path.join(__dirname, '..', 'data', 'rides.json');

// Send a notification to the ride host with participant list
async function sendHostNotification(client, ride) {
  try {
    // Find the host
    const hostId = ride.creatorId;
    const host = await client.users.fetch(hostId);
    
    if (!host) {
      console.error(`Could not find host user with ID ${hostId}`);
      return false;
    }
    
    // Create the participant list
    let participantsList = 'No participants yet';
    
    if (ride.participants && ride.participants.length > 0) {
      participantsList = ride.participants
        .map((p, index) => `${index + 1}. ${p.username}`)
        .join('\n');
    }
    
    // Create an embed for the notification
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`🔔 Ride Host Notification: Your ride starts soon!`)
      .setDescription(`Your ${ride.type} ride is scheduled to start in 30 minutes!`)
      .addFields(
        { name: 'Ride Details', value: `
          **Type:** ${ride.type}
          **Date:** ${ride.date}
          **Meet Time:** ${ride.meetTime}
          **Start Location:** ${ride.startLocation.name}
        `},
        { name: `Participants (${ride.participants.length})`, value: participantsList }
      )
      .setFooter({ text: 'Have a great ride!' })
      .setTimestamp();
    
    // Send the private message to the host
    await host.send({ embeds: [embed] });
    return true;
  } catch (error) {
    console.error('Error sending host notification:', error);
    return false;
  }
}

// Send participant notifications for upcoming rides
async function sendParticipantNotifications(client, ride) {
  try {
    if (!ride.participants || ride.participants.length === 0) {
      return;
    }
    
    // Create an embed for the notification
    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle(`🔔 Ride Reminder: ${ride.vibe} ${ride.type} Ride Tomorrow`)
      .setDescription(`You've signed up for a ride tomorrow! Here are the details:`)
      .addFields(
        { name: 'Ride Details', value: `
          **Type:** ${ride.type}
          **Date:** ${ride.date}
          **Meet Time:** ${ride.meetTime}
          **Start Location:** ${ride.startLocation.name}
          **Drop Style:** ${ride.dropStyle}
        `}
      )
      .setFooter({ text: 'We look forward to seeing you there!' })
      .setTimestamp();
    
    // Add optional fields if provided
    if (ride.endLocation && ride.endLocation.name !== 'Same as start') {
      embed.addFields({ name: 'End Location', value: ride.endLocation.name, inline: true });
    }
    
    if (ride.distance) {
      embed.addFields({ name: 'Distance', value: ride.distance, inline: true });
    }
    
    // Send message to each participant
    for (const participant of ride.participants) {
      try {
        const user = await client.users.fetch(participant.id);
        if (user) {
          await user.send({ embeds: [embed] });
        }
      } catch (err) {
        console.error(`Failed to send notification to user ${participant.username}:`, err);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error sending participant notifications:', error);
    return false;
  }
}

// Schedule notifications for a ride
function scheduleRideNotifications(client, ride, messageId, channelId) {
  try {
    // Parse the ride date and time to create Date objects
    const [month, day] = ride.date.replace(',', '').split(' ');
    const [hour, minute, period] = ride.meetTime.replace(':', ' ').replace('AM', ' AM').replace('PM', ' PM').split(' ');
    
    const months = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
      'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
    };
    
    const monthIndex = months[month];
    const year = new Date().getFullYear();
    
    // Convert hour to 24-hour format
    let hourNum = parseInt(hour);
    if (period === 'PM' && hourNum < 12) {
      hourNum += 12;
    } else if (period === 'AM' && hourNum === 12) {
      hourNum = 0;
    }
    
    // Create ride date
    const rideDate = new Date(year, monthIndex, parseInt(day), hourNum, parseInt(minute));
    
    // Schedule 24-hour reminder for participants
    const participantReminderDate = new Date(rideDate);
    participantReminderDate.setDate(participantReminderDate.getDate() - 1); // 24 hours before
    
    console.log(`Scheduling participant reminder for ${participantReminderDate}`);
    
    schedule.scheduleJob(participantReminderDate, async function() {
      // Load the most up-to-date ride data
      if (!fs.existsSync(dataPath)) return;
      
      const data = fs.readFileSync(dataPath, 'utf8');
      const rides = JSON.parse(data);
      
      const currentRide = rides.find(r => r.messageId === messageId);
      if (currentRide) {
        await sendParticipantNotifications(client, currentRide);
      }
    });
    
    // Schedule 30-minute reminder for the host
    const hostReminderDate = new Date(rideDate);
    hostReminderDate.setMinutes(hostReminderDate.getMinutes() - 30); // 30 minutes before
    
    console.log(`Scheduling host reminder for ${hostReminderDate}`);
    
    schedule.scheduleJob(hostReminderDate, async function() {
      // Load the most up-to-date ride data
      if (!fs.existsSync(dataPath)) return;
      
      const data = fs.readFileSync(dataPath, 'utf8');
      const rides = JSON.parse(data);
      
      const currentRide = rides.find(r => r.messageId === messageId);
      if (currentRide) {
        await sendHostNotification(client, currentRide);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    return false;
  }
}

module.exports = {
  sendHostNotification,
  sendParticipantNotifications,
  scheduleRideNotifications
};