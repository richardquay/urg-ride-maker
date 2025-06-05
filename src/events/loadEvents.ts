import { readdirSync } from 'fs';
import { join } from 'path';
import { client } from '../config/client';

export async function loadEvents() {
    const eventsPath = join(__dirname);
    
    // Read all event files
    const eventFiles = readdirSync(eventsPath)
        .filter(file => file.endsWith('.ts') && file !== 'loadEvents.ts');
    
    for (const file of eventFiles) {
        const filePath = join(eventsPath, file);
        const event = await import(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
    
    console.log('Successfully loaded event handlers.');
} 