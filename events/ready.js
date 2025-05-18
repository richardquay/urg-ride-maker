const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`URG Ride Maker is ready! Logged in as ${client.user.tag}`);
    client.user.setActivity('for /create-ride', { type: 'WATCHING' });
  },
};