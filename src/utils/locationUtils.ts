interface Location {
    name: string;
    url?: string;
}

const LOCATIONS: Record<string, Location> = {
    'ANGRY_CATFISH': {
        name: 'Angry Catfish',
        url: 'https://goo.gl/maps/your-angry-catfish-url'
    },
    'NORTHERN_COFFEEWORKS': {
        name: 'Northern Coffeeworks',
        url: 'https://goo.gl/maps/your-northern-coffeeworks-url'
    }
};

export function getLocationInfo(locationCode: string): Location {
    if (locationCode === 'OTHER') {
        throw new Error('Please provide custom location details');
    }
    
    const location = LOCATIONS[locationCode];
    if (!location) {
        throw new Error('Invalid location selected');
    }
    
    return location;
}

export function formatLocation(location: Location): string {
    if (location.url) {
        return `[${location.name}](${location.url})`;
    }
    return location.name;
}

export function validateLocationUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
        return false;
    }
} 