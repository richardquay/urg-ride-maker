/**
 * Utility functions for handling date and time in the URG Ride Maker
 */

// Format date in "Month Day" format (e.g., "March 15")
function formatDate(dateString) {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    
    const options = { month: 'long', day: 'numeric' };
    
    // Add year if the event is beyond the current month
    const currentDate = new Date();
    if (
      date.getFullYear() > currentDate.getFullYear() ||
      (date.getMonth() > currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear()) ||
      // Also include year if planning across December/January
      (currentDate.getMonth() === 11 && date.getMonth() === 0)
    ) {
      options.year = 'numeric';
    }
    
    return date.toLocaleDateString('en-US', options);
  }
  
  // Parse user input time strings flexibly
  function parseTime(timeString) {
    // Remove any whitespace
    timeString = timeString.trim();
    
    // Try to handle various formats
    let hour, minute, period;
    
    // Format: 9:00 AM, 9:00 am, 9:00AM, 9:00am
    const timeRegex = /^(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?$/;
    const match = timeString.match(timeRegex);
    
    if (match) {
      hour = parseInt(match[1], 10);
      minute = match[2] ? parseInt(match[2], 10) : 0;
      period = match[3] ? match[3].toLowerCase() : null;
      
      // Handle 24-hour format
      if (!period) {
        if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
          // This is valid 24-hour format
          if (hour > 12) {
            // Convert to 12-hour format for display
            period = 'pm';
            hour -= 12;
          } else if (hour === 0) {
            period = 'am';
            hour = 12;
          } else if (hour === 12) {
            period = 'pm';
          } else {
            period = 'am';
          }
        } else {
          throw new Error('Invalid time format');
        }
      } else {
        // 12-hour format validation
        if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
          throw new Error('Invalid time format');
        }
        
        // Adjust for 12 PM (noon)
        if (hour === 12 && period === 'am') {
          hour = 0;
        }
        
        // Adjust for 12 AM (midnight)
        if (hour === 12 && period === 'pm') {
          hour = 12;
        }
      }
      
      // Format the time consistently
      return formatTime(hour, minute, period);
    }
    
    throw new Error('Invalid time format');
  }
  
  // Format time consistently as "9:00 AM"
  function formatTime(hour, minute, period) {
    return `${hour}:${minute.toString().padStart(2, '0')} ${period.toUpperCase()}`;
  }
  
  // Calculate rollout time based on meet time and increment
  function calculateRolloutTime(meetTime, incrementMinutes) {
    // Parse the meet time
    const [timeStr, period] = meetTime.split(' ');
    const [hourStr, minuteStr] = timeStr.split(':');
    
    let hour = parseInt(hourStr);
    let minute = parseInt(minuteStr);
    
    // Convert to 24-hour for calculation
    if (period.toUpperCase() === 'PM' && hour < 12) {
      hour += 12;
    }
    if (period.toUpperCase() === 'AM' && hour === 12) {
      hour = 0;
    }
    
    // Add the increment minutes
    minute += incrementMinutes;
    
    // Handle minute overflow
    if (minute >= 60) {
      hour += Math.floor(minute / 60);
      minute %= 60;
    }
    
    // Handle hour overflow
    hour %= 24;
    
    // Convert back to 12-hour format
    let newPeriod = hour >= 12 ? 'PM' : 'AM';
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    
    return `${hour}:${minute.toString().padStart(2, '0')} ${newPeriod}`;
  }
  
  // Get increment minutes from rollout option
  function getRolloutIncrementMinutes(rolloutOption) {
    // Parse options like "+15 mins" to get the number
    const match = rolloutOption.match(/\+(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 0; // Default to same time
  }
  
  module.exports = {
    formatDate,
    parseTime,
    formatTime,
    calculateRolloutTime,
    getRolloutIncrementMinutes
  };