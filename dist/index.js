import { startBot } from './config/client.js';
import { loadCommands } from './commands/loadCommands.js';
import { loadEvents } from './events/loadEvents.js';
async function main() {
    try {
        // Load commands and events
        await loadCommands();
        await loadEvents();
        // Start the bot
        await startBot();
    }
    catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
}
main();
