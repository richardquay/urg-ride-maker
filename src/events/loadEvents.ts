import { readdirSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import { client } from '../config/client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loadEvents() {
    const eventsPath = join(__dirname);
    
    // Read all event files
    const eventFiles = readdirSync(eventsPath)
        .filter(file => (file.endsWith('.ts') || file.endsWith('.js')) && file !== 'loadEvents.ts' && file !== 'loadEvents.js');
    
    for (const file of eventFiles) {
        let filePath = join(eventsPath, file);
        if (extname(filePath) === '.ts') filePath = filePath.replace(/\.ts$/, '.js');
        const event = await import(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
    
    console.log('Successfully loaded event handlers.');
} 