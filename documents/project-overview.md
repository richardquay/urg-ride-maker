# URG Ride Maker - Project Plan

## Project Overview
URG Ride Maker is a Discord bot that simplifies the organization, discovery, and participation in group cycling rides within Discord communities. This project plan outlines the development approach using Railway.app for database and hosting.

## What This Bot Does
The URG Ride Maker transforms Discord servers into organized cycling communities by:
- **Simplifying ride creation** through an intuitive command interface
- **Automatically organizing rides** into appropriate channels by type
- **Tracking participation** with real-time updates
- **Sending reminders** to participants and hosts
- **Providing visual calendars** for ride discovery
- **Building community** through structured cycling events

## Target Audience
- **Cycling Clubs**: Formal organizations needing event management
- **Bike Shops**: Stores organizing customer rides
- **Informal Groups**: Friends coordinating regular rides
- **Virtual Cyclists**: Zwift and indoor cycling communities
- **Event Organizers**: People managing races and special events

## Core Features

### 1. Ride Creation System
Users can create rides using:
- **Slash Command** (`/create-ride`): Direct parameter input for experienced Discord users
- **User Context Menu**: Right-click any user > Apps > Create Ride for quick access

Both methods collect comprehensive ride information including:
- Ride type and intensity (vibe)
- Date, time, and meeting details
- Start and end locations with map links
- Distance and route information
- Drop policy for group management

### 2. Automated Channel Organization
Rides automatically post to dedicated channels based on type:
- **#road-rides**: Road cycling events
- **#gravel-rides**: Gravel and adventure rides
- **#mtb-rides**: Mountain biking
- **#social-rides**: Casual group rides
- **#virtual-rides**: Zwift and indoor cycling
- **#races**: Competitive events (admin-only)

### 3. Participation Management
- **Reaction-based RSVP**: Click emoji to join rides
- **Multiple commitment levels**: "Interested" vs "Maybe"
- **Real-time updates**: Participant lists update instantly
- **Participant tracking**: Database storage of all RSVPs

### 4. Visual Calendar System

#### `/my-rides` Command
Displays a personal calendar showing:
- **Grid-based weekly layout**
  - Days as columns
  - Time slots as rows
  - Color-coded ride types
- **Interactive elements**
  - Clickable ride blocks
  - Hover tooltips with details
  - Current time marker
- **Navigation controls**
  - Week forward/backward
  - Jump to current week
  - Month view toggle

#### `/all-group-rides` Command
Shows all upcoming rides in the server with:
- Same visual calendar interface
- Filtering options by ride type
- Highlighted personal participations
- Community-wide view of activities

### 5. Rich Message Formatting
Each ride announcement includes:
- **Header Section**
  - Ride type emoji and name
  - Host information with avatar
  - Creation timestamp
- **Main Content**
  - Time details (meet and rollout)
  - Location details with map links
  - Ride specifications
  - Distance and route information
- **Participant Section**
  - Current participant count
  - List of confirmed riders
  - Maybe/Interested indicators
- **Interactive Elements**
  - Reaction buttons for RSVP
  - Clickable location links
  - Dynamic participant updates

### 6. Notification System
- **24-hour reminders**: DM participants before rides
- **30-minute host alerts**: Send participant list to organizers
- **Customizable preferences**: Users can manage notification settings
- **Reliable delivery**: Handles blocked DMs gracefully

### 7. Admin Configuration
Server administrators can:
- **Map channels** to ride types using `/settings channels`
- **Configure permissions** for ride creation
- **Enable/disable** race type for competitive events
- **Customize defaults** for their community

## Technical Architecture

### Bot Structure
```
urg-ride-maker/
├── src/
│   ├── commands/          # Slash commands and context menus
│   ├── events/           # Discord event handlers
│   ├── utils/            # Helper functions
│   ├── services/         # Business logic
│   ├── database/         # Prisma schema and migrations
│   └── config/           # Configuration files
├── index.js              # Main bot entry point
└── deploy-commands.js    # Command deployment script
```

### Technology Stack
- **Runtime**: Node.js 20.x
- **Framework**: Discord.js v14
- **Database**: PostgreSQL (via Railway)
- **ORM**: Prisma
- **Hosting**: Railway.app
- **Scheduling**: node-cron for notifications

### Database Design
The database stores:
- **Guilds**: Server configurations and channel mappings
- **Rides**: Complete ride information with all details
- **Participants**: User RSVPs and participation status
- **Settings**: User preferences and notification options

### Key Implementation Details

#### Smart Defaults
- **Start Location**: Angry Catfish Bicycle (customizable)
- **Rollout Time**: +15 minutes after meet time
- **Drop Style**: "No Drop" for Party vibe rides
- **Participation**: "Interested" as default status

#### Data Validation
- Future dates only for ride creation
- Valid time formats with flexible parsing
- URL validation for custom locations
- Permission checks for admin features

#### User Experience
- Embeds with color coding by ride type
- Emojis for visual identification
- Natural language date parsing
- Automatic unit conversion (km to miles)

## Benefits for Communities

### For Organizers
- **Reduced coordination time**: Structured forms ensure complete information
- **Automated reminders**: Never manually track participants again
- **Consistent formatting**: All rides look professional
- **Easy management**: Cancel or modify rides with commands

### For Participants
- **Easy discovery**: Visual calendars show all opportunities
- **One-click joining**: Simple reaction-based RSVP
- **Reliable reminders**: Never miss a ride
- **Complete information**: All details in one place

### For Administrators
- **Channel organization**: Automatic routing keeps servers tidy
- **Permission control**: Manage who can create events
- **Community growth**: Better organization attracts members
- **Low maintenance**: Bot runs autonomously

## Success Metrics
- **Adoption Rate**: Percentage of members using the bot
- **Ride Completion**: Percentage of planned rides that occur
- **Participation Growth**: Average riders per event over time
- **User Retention**: Repeat usage by organizers
- **Community Growth**: Server membership increases

## Security & Privacy
- No personal data collection beyond Discord IDs
- Secure database storage on Railway
- Permission-based access control
- No external data sharing
- Automatic data cleanup for old rides

## Future Enhancement Possibilities
- Strava integration for route importing
- Weather forecasts for ride days
- Recurring ride templates
- Post-ride photo sharing
- Ride statistics and leaderboards
- Mobile companion app

## Why URG Ride Maker?
This bot transforms chaotic ride planning into organized community events. By providing structure, automation, and visual tools, it removes friction from group cycling coordination and helps communities thrive. Whether you're organizing daily shop rides or planning a special century event, URG Ride Maker ensures everyone has the information they need and no one gets left behind.