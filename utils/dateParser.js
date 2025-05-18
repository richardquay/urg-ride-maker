// utils/dateParser.js

const { format, parse, addDays, isValid, parseISO } = require('date-fns');

/**
 * Parse a fuzzy date string into a standardized date format
 * Accepts:
 * - Natural language: "today", "tomorrow", "next friday"
 * - Month names: "May 15", "June 2nd"
 * - Standard format: "MM/DD"
 * 
 * @param {string} dateInput - The user's date input
 * @returns {object} - { success: boolean, date: string, error: string }
 */
function parseFuzzyDate(dateInput) {
  if (!dateInput || typeof dateInput !== 'string') {
    return {
      success: false,
      date: null,
      error: 'Please provide a date in MM/DD format, month name (May 15), or words like "today" or "tomorrow".'
    };
  }

  // Normalize input by trimming and converting to lowercase
  const normalizedInput = dateInput.trim().toLowerCase();
  const today = new Date();
  let parsedDate = null;

  // Handle natural language dates
  if (normalizedInput === 'today') {
    parsedDate = today;
  } else if (normalizedInput === 'tomorrow') {
    parsedDate = addDays(today, 1);
  } else if (normalizedInput.startsWith('next ')) {
    // Handle "next monday", "next tuesday", etc.
    const dayOfWeek = normalizedInput.substring(5);
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDayIndex = daysOfWeek.indexOf(dayOfWeek);
    
    if (targetDayIndex !== -1) {
      const currentDayIndex = today.getDay();
      let daysToAdd = (targetDayIndex - currentDayIndex + 7) % 7;
      // If it's the same day, we go to next week
      daysToAdd = daysToAdd === 0 ? 7 : daysToAdd;
      parsedDate = addDays(today, daysToAdd);
    }
  }

  // Handle month name formats (May 15, June 2nd)
  if (!parsedDate) {
    // Remove any suffix like "st", "nd", "rd", "th"
    const cleanInput = normalizedInput.replace(/(st|nd|rd|th)/, '');
    
    try {
      // Try various date formats
      const possibleFormats = [
        'MMMM d', // May 15
        'MMM d',  // May 15
        'M/d',    // 5/15
        'MM/dd'   // 05/15
      ];

      for (const formatString of possibleFormats) {
        try {
          const attemptedParse = parse(cleanInput, formatString, new Date());
          if (isValid(attemptedParse)) {
            parsedDate = attemptedParse;
            break;
          }
        } catch (e) {
          // Continue to the next format if this one fails
          continue;
        }
      }
      
      // Last resort: try direct ISO parsing
      if (!parsedDate) {
        const isoParsed = parseISO(cleanInput);
        if (isValid(isoParsed)) {
          parsedDate = isoParsed;
        }
      }
    } catch (e) {
      // If all parsing attempts fail
      return {
        success: false,
        date: null,
        error: `Could not understand "${dateInput}". Please use MM/DD format, month name (May 15), or words like "today" or "tomorrow".`
      };
    }
  }

  // If we still don't have a valid date, return an error
  if (!parsedDate || !isValid(parsedDate)) {
    return {
      success: false,
      date: null,
      error: `Could not understand "${dateInput}". Please use MM/DD format, month name (May 15), or words like "today" or "tomorrow".`
    };
  }

  // Format the date according to business rules
  const formattedDate = formatDateWithBusinessRules(parsedDate);

  return {
    success: true,
    date: formattedDate,
    error: null
  };
}

/**
 * Format the date according to business rules:
 * - Format as "Month Day" (e.g., "May 15")
 * - Include year only if:
 *   - The event is in a future month beyond the current month
 *   - Events are being planned across December and January
 * 
 * @param {Date} date - The parsed date object
 * @returns {string} - The formatted date string
 */
function formatDateWithBusinessRules(date) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const dateMonth = date.getMonth();
  const dateYear = date.getFullYear();

  // Check if we need to include the year
  const includeYear = 
    // Event is in a future year
    dateYear > currentYear ||
    // Event is in a future month in the current year
    (dateYear === currentYear && dateMonth > currentMonth) ||
    // Planning across December-January boundary
    (currentMonth === 11 && dateMonth === 0);

  // Format the date
  return includeYear 
    ? format(date, 'MMMM d, yyyy') 
    : format(date, 'MMMM d');
}

module.exports = {
  parseFuzzyDate
};