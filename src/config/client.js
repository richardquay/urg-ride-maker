import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { config } from 'dotenv';

// Load environment variables
config();

// Create Discord client with necessary intents
export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
    ],
});

// Error handling
client.on('error', (error) => {
    console.error('Discord client error:', error);
});

// Ready event
client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

// Export a function to start the bot
export const startBot = async () => {
    try {
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        console.error('Failed to start bot:', error);
        process.exit(1);
    }
}; 