import { parse, format, addMinutes, addDays, isAfter } from 'date-fns';
export function parseDate(dateStr) {
    // Try parsing relative dates first
    const now = new Date();
    if (dateStr.toLowerCase() === 'tomorrow') {
        return addDays(now, 1);
    }
    if (dateStr.toLowerCase().startsWith('next ')) {
        const dayOfWeek = dateStr.toLowerCase().replace('next ', '');
        const days = {
            'monday': 1,
            'tuesday': 2,
            'wednesday': 3,
            'thursday': 4,
            'friday': 5,
            'saturday': 6,
            'sunday': 0
        };
        if (dayOfWeek in days) {
            const targetDay = days[dayOfWeek];
            const currentDay = now.getDay();
            const daysToAdd = (targetDay - currentDay + 7) % 7;
            return addDays(now, daysToAdd + 7);
        }
    }
    // Try parsing MM/DD format
    try {
        const parsedDate = parse(dateStr, 'MM/dd', now);
        if (isAfter(parsedDate, now)) {
            return parsedDate;
        }
        // If the date is in the past, assume it's for next year
        return addDays(parsedDate, 365);
    }
    catch {
        throw new Error('Invalid date format. Please use "tomorrow", "next [day]", or "MM/DD" format.');
    }
}
export function parseTime(timeStr) {
    // Try parsing various time formats
    const formats = [
        'h:mm a', // 9:00 AM
        'HH:mm', // 21:00
        'h:mma', // 9:00AM
        'ha', // 9AM
        'h a' // 9 AM
    ];
    for (const fmt of formats) {
        try {
            const parsedTime = parse(timeStr, fmt, new Date());
            return format(parsedTime, 'h:mm a');
        }
        catch {
            continue;
        }
    }
    throw new Error('Invalid time format. Please use formats like "9:00 AM", "21:00", "9AM", etc.');
}
export function calculateRolloutTime(meetTime, rolloutMinutes) {
    const parsedMeetTime = parse(meetTime, 'h:mm a', new Date());
    const rolloutTime = addMinutes(parsedMeetTime, parseInt(rolloutMinutes));
    return format(rolloutTime, 'h:mm a');
}
export function formatDate(date) {
    return format(date, 'MMMM d');
}
