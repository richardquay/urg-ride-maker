const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '..', 'data', 'rides.json');

const dayEmojis = [
  '🟠', // Sunday
  '🔵', // Monday
  '🟢', // Tuesday
  '🟣', // Wednesday
  '🟡', // Thursday
  '🟤', // Friday
  '🔴', // Saturday
];
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function isSameWeek(d1, d2) {
  const start1 = getStartOfWeek(d1);
  const start2 = getStartOfWeek(d2);
  return isSameDay(start1, start2);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('my-rides')
    .setDescription('View your upcoming rides in a weekly calendar'),

  async execute(interaction) {
    // Load all rides
    let rides = [];
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      rides = JSON.parse(data);
    }
    const userId = interaction.user.id;
    // Find rides user is hosting or participating in
    const userRides = rides.filter(ride =>
      ride.creatorId === userId || (ride.participants && ride.participants.some(p => p.id === userId))
    );
    // Parse dates and group by week/day
    const now = new Date();
    const startOfThisWeek = getStartOfWeek(now);
    const endOfThisWeek = new Date(startOfThisWeek);
    endOfThisWeek.setDate(endOfThisWeek.getDate() + 6);
    // Group rides by day of this week
    const weekRides = Array(7).fill(null).map(() => []);
    const futureRides = [];
    userRides.forEach(ride => {
      const rideDate = new Date(ride.date + ' ' + new Date().getFullYear());
      if (!isNaN(rideDate.getTime())) {
        if (rideDate >= startOfThisWeek && rideDate <= endOfThisWeek) {
          weekRides[rideDate.getDay()].push(ride);
        } else if (rideDate > endOfThisWeek) {
          futureRides.push(ride);
        }
      }
    });
    // Build embed
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('My Rides: This Week')
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();
    // Add fields for each day
    for (let i = 0; i < 7; i++) {
      const ridesForDay = weekRides[i];
      // Calculate the date for this day
      const dayDate = new Date(startOfThisWeek);
      dayDate.setDate(dayDate.getDate() + i);
      const options = { month: 'long', day: 'numeric' };
      const dateStr = dayDate.toLocaleDateString('en-US', options);
      let value = '';
      if (ridesForDay.length === 0) {
        value = '_No rides_';
      } else {
        const ridesList = ridesForDay.map(ride => {
          const isHost = ride.creatorId === userId;
          const isParticipant = ride.participants && ride.participants.some(p => p.id === userId);
          const rideTitle = `**${ride.vibe} ${ride.type}**`;
          const time = ride.meetTime ? `at ${ride.meetTime}` : '';
          const link = ride.messageId && ride.channelId ? `([details](https://discord.com/channels/${interaction.guildId}/${ride.channelId}/${ride.messageId}))` : '';
          let joined = '';
          if (isHost) joined = '🟩';
          else if (isParticipant) joined = '✅';
          return `${joined} ${rideTitle} ${time} ${link}`;
        });
        const maxRides = 5;
        value = ridesList.slice(0, maxRides).join('\n');
        if (ridesForDay.length > maxRides) {
          value += `\n_+${ridesForDay.length - maxRides} more rides..._`;
        }
      }
      embed.addFields({
        name: `${dayEmojis[i]} ${dayNames[i]}, ${dateStr}`,
        value,
        inline: false // stack vertically for mobile
      });
    }
    // Add a separator before future rides
    if (futureRides.length > 0) {
      embed.addFields({ name: '\u200B', value: '\n---\n', inline: false });
    }
    if (futureRides.length > 0) {
      let futureText = futureRides.map(ride => {
        const isHost = ride.creatorId === userId;
        const isParticipant = ride.participants && ride.participants.some(p => p.id === userId);
        const rideTitle = `**${ride.vibe} ${ride.type}**`;
        const date = ride.date;
        const time = ride.meetTime ? `at ${ride.meetTime}` : '';
        const link = ride.messageId && ride.channelId ? `([details](https://discord.com/channels/${interaction.guildId}/${ride.channelId}/${ride.messageId}))` : '';
        let joined = '';
        if (isHost) joined = '🟩';
        else if (isParticipant) joined = '✅';
        return `${joined} ${rideTitle} on ${date} ${time} ${link}`;
      }).join('\n');
      embed.addFields({ name: '📅 Future Rides', value: futureText, inline: false });
    }
    // Add a footer
    embed.setFooter({ text: '✅ = You are signed up. To create a new ride, use /create-ride or /create-ride-form' });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('all-rides')
    .setDescription('View all upcoming rides in a weekly calendar'),

  async execute(interaction) {
    // Load all rides
    let rides = [];
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      rides = JSON.parse(data);
    }
    // Parse dates and group by week/day
    const now = new Date();
    const startOfThisWeek = getStartOfWeek(now);
    const endOfThisWeek = new Date(startOfThisWeek);
    endOfThisWeek.setDate(endOfThisWeek.getDate() + 6);
    // Group rides by day of this week
    const weekRides = Array(7).fill(null).map(() => []);
    const futureRides = [];
    rides.forEach(ride => {
      const rideDate = new Date(ride.date + ' ' + new Date().getFullYear());
      if (!isNaN(rideDate.getTime())) {
        if (rideDate >= startOfThisWeek && rideDate <= endOfThisWeek) {
          weekRides[rideDate.getDay()].push(ride);
        } else if (rideDate > endOfThisWeek) {
          futureRides.push(ride);
        }
      }
    });
    // Build embed
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('All Rides: This Week')
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();
    // Add fields for each day
    for (let i = 0; i < 7; i++) {
      const ridesForDay = weekRides[i];
      // Calculate the date for this day
      const dayDate = new Date(startOfThisWeek);
      dayDate.setDate(dayDate.getDate() + i);
      const options = { month: 'long', day: 'numeric' };
      const dateStr = dayDate.toLocaleDateString('en-US', options);
      let value = '';
      if (ridesForDay.length === 0) {
        value = '_No rides_';
      } else {
        const ridesList = ridesForDay.map(ride => {
          const rideTitle = `**${ride.vibe} ${ride.type}**`;
          const time = ride.meetTime ? `at ${ride.meetTime}` : '';
          const link = ride.messageId && ride.channelId ? `([details](https://discord.com/channels/${interaction.guildId}/${ride.channelId}/${ride.messageId}))` : '';
          return `${rideTitle} ${time} ${link}`;
        });
        const maxRides = 5;
        value = ridesList.slice(0, maxRides).join('\n');
        if (ridesForDay.length > maxRides) {
          value += `\n_+${ridesForDay.length - maxRides} more rides..._`;
        }
      }
      embed.addFields({
        name: `${dayEmojis[i]} ${dayNames[i]}, ${dateStr}`,
        value,
        inline: false
      });
    }
    // Add a separator before future rides
    if (futureRides.length > 0) {
      embed.addFields({ name: '\u200B', value: '\n---\n', inline: false });
    }
    if (futureRides.length > 0) {
      let futureText = futureRides.map(ride => {
        const rideTitle = `**${ride.vibe} ${ride.type}**`;
        const date = ride.date;
        const time = ride.meetTime ? `at ${ride.meetTime}` : '';
        const link = ride.messageId && ride.channelId ? `([details](https://discord.com/channels/${interaction.guildId}/${ride.channelId}/${ride.messageId}))` : '';
        return `${rideTitle} on ${date} ${time} ${link}`;
      }).join('\n');
      embed.addFields({ name: '📅 Future Rides', value: futureText, inline: false });
    }
    // Add a footer
    embed.setFooter({ text: 'To create a new ride, use /create-ride or /create-ride-form' });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};