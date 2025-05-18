// Basic configuration for the URG Ride Maker bot

module.exports = {
    // Bot settings
    prefix: '/',
    
    // Default ride options
    weatherApiKey: process.env.WEATHER_API_KEY,
    
    defaultOptions: {
      startLocation: 
      {
        name: 'Angry Catfish',
        url: 'https://maps.app.goo.gl/hoCFdQG9eiPjTgaL6'
      },
      locations: [
        {
          name: 'Angry Catfish',
          url: 'https://maps.app.goo.gl/hoCFdQG9eiPjTgaL6',
          coordinates: {
            latitude: 44.9537,
            longitude: -93.2277
          },
          emoji: '🐟'
        },
        {
          name: 'Northern Coffeeworks',
          url: 'https://maps.app.goo.gl/xLGR16zgg7tWBydbA',
          coordinates: {
            latitude: 44.9537,
            longitude: -93.2277
          },
          emoji: '☕'
        },
        {
          name: 'Park\'s House',
          url: 'https://maps.app.goo.gl/c54ucqGzTaFJXRRe8',
          emoji: '🏠'
        }
      ],
      endLocations: [
        {
          name: 'Venn Brewery',
          url: 'https://maps.app.goo.gl/ZXY7Zb256S1pEPFTA',
          emoji: '🍺'
        },
        {
          name: 'Bulls Horn',
          url: 'https://maps.app.goo.gl/x1Fm5ZT4f4poJQE66',
          emoji: '🐂'
        },
        {
          name: 'Sea Salt',
          url: 'https://maps.app.goo.gl/yq7cyLVbiMarbFzb8',
          emoji: '🌊'
        },
        {
          name: 'Dada\'s Beach',
          url: 'https://maps.app.goo.gl/UWuiDyndUuADWZqV6',
          emoji: '🏖️'
        }
      ],
      rolloutTimeOptions: [
        { label: 'Same time', value: 0 },
        { label: '+15 mins', value: 15 },
        { label: '+30 mins', value: 30 },
        { label: '+45 mins', value: 45 },
        { label: '+1 hour', value: 60 }
      ],
      defaultRolloutTime: '+15 mins'
    },
    
    // Ride types configuration
    rideTypes: {
      'Road': {
        emoji: '🚴',
        channelName: 'road-rides',
        channelId: '1369666762601140295'
      },
      'Gravel': {
        emoji: '🚵‍♂️',
        channelName: 'gravel-rides',
        channelId: '1369666794444296274'
      },
      'Mountain': {
        emoji: '🚵',
        channelName: 'mtb-rides',
        channelId: '1369666736424488990'
      },
      'Social': {
        emoji: '🍻',
        channelName: 'social-rides',
        channelId: '1370182475170582558'
      },
      'Virtual': {
        emoji: '💻',
        channelName: 'virtual-rides'
      },
      'Race': {
        emoji: '🏁',
        channelName: 'races',
        adminOnly: true
      }
    },
    
    // Ride vibes
    rideVibes: {
      'Spicy': {
        emoji: '🌶️',
        description: 'fast-paced, speedy, challenging ride'
      },
      'Party': {
        emoji: '🎉',
        description: 'party-pace, casual, social ride'
      }
    },
    
    // Drop styles
    dropStyles: [
      'Drop',
      'No Drop',
      'Regroup'
    ]
  };

function getLocation(configList, pickerValue, customValue) {
  if (customValue) {
    return { name: customValue, url: null };
  }
  if (pickerValue) {
    return configList.find(loc => loc.name === pickerValue) || null;
  }
  return null;
}

module.exports.getLocation = getLocation;

function createRideEmbed(rideData, creator) {
  const { vibe, type, dropStyle, date, meetTime, rolloutTime, startLocation, endLocation, distance, routeSource } = rideData;
  const vibeDetails = config.rideVibes[vibe];
  const typeDetails = config.rideTypes[type];

  let color;
  switch (type) {
    case 'Road': color = 0x3498db; break;
    case 'Gravel': color = 0xe67e22; break;
    case 'Mountain': color = 0x2ecc71; break;
    case 'Social': color = 0x9b59b6; break;
    case 'Virtual': color = 0x1abc9c; break;
    case 'Race': color = 0xe74c3c; break;
    default: color = 0x95a5a6;
  }

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${vibeDetails.emoji} ${vibe.toUpperCase()} ${type.toUpperCase()} RIDE`)
    .setDescription(
      `**Date:** ${date}\n` +
      `**Meet:** ${meetTime} - Rollout: ${rolloutTime}\n` +
      `**Start:** [${startLocation.name}](${startLocation.url})\n` +
      `**Drop Style:** ${dropStyle}`
    )
    .setFooter({
      text: `${typeDetails.emoji} React with this emoji if you're interested in joining this ride!`
    })
    .setTimestamp()
    .setThumbnail(creator.displayAvatarURL({ extension: 'png', size: 32 }));

  if (endLocation && endLocation.name !== 'Same as start') {
    embed.addFields({ name: 'End Location', value: `[${endLocation.name}](${endLocation.url})`, inline: true });
  }
  if (distance) {
    embed.addFields({ name: 'Distance', value: distance, inline: true });
  }
  if (routeSource) {
    embed.addFields({ name: 'Route', value: routeSource });
  }

  // Add the "Hosted by" section at the end
  embed.addFields({
    name: '\u200B',
    value: `**Hosted by:** <@${creator.id}>`,
    inline: false
  });

  return embed;
}