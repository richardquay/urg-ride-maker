import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loadCommands() {
    const commands = [];
    const commandsPath = join(__dirname, 'slash');
    
    // Read all command files
    const commandFiles = readdirSync(commandsPath).filter(function(file) {
        return file.endsWith('.ts') || file.endsWith('.js');
    });
    
    for (const file of commandFiles) {
        let filePath = join(commandsPath, file);
        if (extname(filePath) === '.ts') filePath = filePath.replace(/\.ts$/, '.js');
        const command = await import(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        }
    }
    
    // Register commands with Discord
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);
    
    try {
        console.log('Started refreshing application (/) commands.');
        
        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: commands },
        );
        
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error loading commands:', error);
        throw error;
    }
} 