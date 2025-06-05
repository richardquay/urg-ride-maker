# Cursor Rules for URG Ride Maker

You are an expert Discord.js developer building a cycling ride organization bot. Follow these rules strictly.

## Code Style
- Use ES6+ JavaScript with async/await
- Prefer const over let, never use var
- Use descriptive variable names (not abbreviations)
- Add JSDoc comments for all functions
- Handle all errors with try/catch blocks
- Use early returns to reduce nesting
- Keep functions small and focused

## Discord.js Specific
- Use Discord.js v14 patterns
- Always defer replies for commands that might take time
- Use embeds for rich content display
- Implement proper permission checking
- Use builders for slash commands
- Cache frequently accessed data
- Handle rate limits gracefully

## Database Rules
- Use Prisma ORM for all database operations
- Always use transactions for multi-step operations
- Validate data before database insertion
- Use proper indexes for performance
- Handle unique constraint violations
- Use select to limit returned fields
- Implement soft deletes where appropriate

## Project Structure
- Organize commands in subfolders by category
- Keep utility functions pure and testable
- Separate business logic from Discord logic
- Use services for complex operations
- Keep configuration in dedicated files
- Never hardcode IDs or secrets

## Error Handling
- Always provide user-friendly error messages
- Log detailed errors for debugging
- Use different log levels appropriately
- Never expose internal errors to users
- Implement retry logic for transient failures
- Gracefully handle missing permissions

## Validation Rules
- Validate all user inputs
- Check date is in the future for ride creation
- Ensure required fields are present
- Validate URL formats
- Check user has appropriate roles
- Validate time formats before parsing
- Ensure locations have both name and URL

## Best Practices
- Make embeds colorful and visually appealing
- Use emojis to enhance readability
- Keep response times under 2 seconds
- Implement pagination for long lists
- Cache channel mappings
- Use constants for magic values
- Implement health checks

## Testing Approach
- Test all commands manually first
- Verify database operations work correctly
- Test error scenarios
- Check permission handling
- Verify notification timing
- Test with multiple users
- Validate embed formatting

## Security
- Never log sensitive information
- Validate all inputs against injection
- Use environment variables for secrets
- Implement rate limiting
- Check permissions before operations
- Sanitize user-provided URLs
- Prevent mass-mention abuse

## Performance
- Use bulk operations where possible
- Implement efficient database queries
- Cache static data
- Lazy load optional features
- Optimize embed generation
- Minimize API calls
- Use database indexes effectively

## User Experience
- Provide clear feedback for all actions
- Show loading states for long operations
- Confirm destructive actions
- Use ephemeral messages for errors
- Make help text comprehensive
- Support command autocomplete
- Handle edge cases gracefully

## Specific Implementations

### Ride Creation
- Default to Angry Catfish location
- Default to +15 mins rollout time
- Auto-set "No Drop" for Party vibe
- Show modal only for "Other" locations
- Format dates as "Month Day"
- Convert km to miles automatically

### Participation System
- Add reaction immediately after posting
- Update participant count in real-time
- Support both "Interested" and "Maybe"
- Prevent duplicate participation
- Show numbered participant list

### Notifications
- Use node-cron for scheduling
- Send DMs, not channel messages
- Handle blocked DMs gracefully
- Include all ride details
- Provide ride link in notification
- Allow notification preferences

### Data Management
- Store times in UTC
- Display in server timezone
- Maintain data integrity
- Regular cleanup of old rides
- Efficient participant queries
- Proper cascade deletes

### Visual Calendar
- Use embed fields for grid layout
- Color code by ride type
- Show current week by default
- Implement week navigation buttons
- Highlight user's rides
- Maximum 7 days per embed
- Time slots as row indicators

### Admin Commands
- Check admin/mod permissions first
- Use select menus for channel selection
- Store mappings in Guild table
- Provide current configuration display
- Validate channel permissions
- Log configuration changes

## Railway.app Specific
- Use DATABASE_URL from environment
- Handle connection pooling properly
- Implement graceful shutdown
- Use Prisma migrations for schema changes
- Monitor database performance
- Handle connection errors

## Command Examples

### Good Implementation
```javascript
// Always validate inputs
if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ 
        content: 'Only administrators can configure channels.', 
        ephemeral: true 
    });
}

// Use transactions for related operations
await prisma.$transaction(async (tx) => {
    const ride = await tx.ride.create({ data: rideData });
    await tx.participant.create({ 
        data: { 
            rideId: ride.id, 
            userId: interaction.user.id,
            status: 'interested'
        } 
    });
});
```

### Bad Implementation
```javascript
// Don't expose errors
interaction.reply(`Error: ${error.message}`);

// Don't use var or unclear names
var x = await getRides();

// Don't skip validation
const date = new Date(userInput); // Could be invalid
```

When generating code, always consider these rules and implement robust, user-friendly solutions that follow Discord best practices.