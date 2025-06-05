import { client, startBot } from './config/client';
import { loadCommands } from './commands/loadCommands';
import { loadEvents } from './events/loadEvents';

async function main() {
    try {
        // Load commands and events
        await loadCommands();
        await loadEvents();
        
        // Start the bot
        await startBot();
    } catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
}

main(); 