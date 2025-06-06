export function parseDistance(distanceStr) {
    // Remove any whitespace and convert to lowercase
    const cleanStr = distanceStr.trim().toLowerCase();
    
    // Extract the number and unit
    const match = cleanStr.match(/^(\d+(?:\.\d+)?)\s*(km|miles?|mi)?$/);
    
    if (!match) {
        throw new Error('Invalid distance format. Please use formats like "20 miles" or "32 km"');
    }
    
    const [, number, unit] = match;
    const distance = parseFloat(number);
    
    // If no unit is specified, default to miles
    if (!unit) {
        return { distance, unit: 'miles' };
    }
    
    // Normalize the unit
    if (unit === 'km') {
        return { distance, unit: 'kilometers' };
    }
    
    return { distance, unit: 'miles' };
}

export function convertToMiles(distance, unit) {
    if (unit === 'kilometers') {
        return distance * 0.621371;
    }
    return distance;
}

export function formatDistance(distance, unit) {
    const miles = convertToMiles(distance, unit);
    return `${miles.toFixed(1)} miles`;
} 