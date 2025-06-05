# URG Ride Maker Discord Bot

## Project Overview
You are building a Discord bot for organizing group cycling rides. The bot allows users to create, join, and manage cycling events within Discord communities. It uses PostgreSQL (via Prisma ORM) hosted on Railway.app.

## Core Features to Implement

### 1. Ride Creation System
- Two ways to create rides:
  - `/create-ride` - Parameter-based command for Discord power users
  - User context menu - Right-click any user > Apps > Create Ride
- Both methods collect the same data and produce identical outputs

### 2. Ride Data Structure
Required fields:
- **Vibe**: 🌶️ Spicy or 🎉 Party
- **Type**: Road, Gravel, Mountain, Social, Virtual, Race (admin only)
- **Drop Style**: Drop, No Drop, Regroup (auto "No Drop" if Party vibe)
- **Date**: Flexible parsing, format as "Month Day"
- **Meet Time**: When to arrive
- **Rollout Time**: When ride starts (+0, +15 default, +30, +45, +60 mins)
- **Start Location**: Angry Catfish (default), Northern Coffeeworks, or Other

Optional fields:
- **End Location**: Same as start (default) or custom
- **Distance**: Number with optional "km" (auto-convert to miles)
- **Route Source**: URL to Strava/RideWithGPS/etc
- **Notes**: Additional information

### 3. Channel Configuration (Admin Only)
- `/settings channels` - Maps Discord channels to ride types
- Only users with admin/mod roles can configure
- Stores channel IDs in database per guild
- Example: #road-rides → ROAD type

### 4. Channel Routing
Posts automatically route to configured channels:
- Road → configured road channel
- Gravel → configured gravel channel
- Mountain → configured MTB channel
- Social → configured social channel
- Virtual → configured virtual channel
- Race → configured race channel (admin only)

### 5. Participation Tracking
- Bot adds type-specific emoji reaction to each ride post
- Users click reaction to join (stored in database)
- Participant list updates in real-time on the ride embed
- Support "Interested" (👍) and "Maybe" (🤔) reactions

### 6. Notification System
- **24 hours before**: DM all participants with ride details
- **30 minutes before**: DM host with participant list
- Use scheduled jobs to check and send notifications

### 7. Calendar Commands

#### `/my-rides`
Shows personal weekly calendar with:
- Grid-based layout (days as columns, time as rows)
- Color-coded ride types
- Rides user is hosting or joined
- Interactive navigation (week forward/back)
- Clickable ride blocks for details

#### `/all-group-rides`
Shows all server rides with:
- Same visual calendar interface
- All upcoming rides in the server
- Filter options by ride type
- Highlighted personal participations

## Technical Implementation

### Database Schema (Prisma)
```prisma
model Guild {
  id              String   @id
  name            String?
  
  // Channel mappings
  roadChannelId     String?
  gravelChannelId   String?
  mtbChannelId      String?
  socialChannelId   String?
  virtualChannelId  String?
  raceChannelId     String?
  
  settings        Json     @default("{}")
  rides           Ride[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Ride {
  id              String   @id @default(cuid())
  guildId         String
  guild           Guild    @relation(fields: [guildId], references: [id])
  messageId       String?
  channelId       String
  creatorId       String
  type            String
  vibe            String
  dropStyle       String
  date            DateTime
  meetTime        String
  rolloutTime     String
  startLocationName    String
  startLocationUrl     String?
  endLocationName      String?
  endLocationUrl       String?
  distance        Float?
  distanceUnit    String?
  routeSource     String?
  notes           String?
  participants    Participant[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Participant {
  id              String   @id @default(cuid())
  rideId          String
  ride            Ride     @relation(fields: [rideId], references: [id], onDelete: Cascade)
  userId          String
  userName        String
  status          String   @default("interested")
  joinedAt        DateTime @default(now())
  
  @@unique([rideId, userId])
}
```

### Message Embed Format
```
# {Vibe Emoji} {VIBE} {TYPE} RIDE
**Date:** {formatted date}
**Meet:** {meet time} - Rollout: {calculated rollout time}
**Start:** [{location name}]({location URL})
**End:** [{location name}]({location URL}) // Only if different
**Distance:** {distance} miles // Only if provided
**Drop Style:** {drop style}
**Route:** [{route source}]({route URL}) // Only if provided
**Hosted by:** @{username}

{Type Emoji} React to join this ride!

**Participants ({count}):**
1. @user1
2. @user2
...

**Maybe ({count}):**
1. @user3
2. @user4
...
```

### Visual Calendar Implementation
- Use Discord embeds with fields for calendar grid
- Each day is a field (inline: true)
- Time blocks shown as formatted text
- Color coding via embed color property
- Navigation via button components
- Maximum 25 fields per embed (plan accordingly)

### Color Scheme
- Road: 0x0099FF (Blue)
- Gravel: 0x8B4513 (Brown)
- Mountain: 0x228B22 (Green)
- Social: 0xFFD700 (Yellow)
- Virtual: 0x9370DB (Purple)
- Race: 0xFF0000 (Red)

### Key Implementation Notes
1. Use Discord.js v14 with slash commands
2. Store all data in PostgreSQL via Prisma
3. Use embeds for rich formatting
4. Implement modular command structure
5. Handle errors gracefully with user-friendly messages
6. Use transactions for multi-step operations
7. Cache channel mappings per guild

### Modal Implementation
When "Other" is selected for locations:
1. Show modal with fields for location name and Google Maps URL
2. Both fields are required
3. Validate URL format
4. Store custom location in database

### Time Parsing
- Support multiple formats: "9:00 AM", "21:00", "9pm"
- Support natural language: "tomorrow", "next Tuesday"
- Calculate rollout time based on meet time + selected increment

### Distance Conversion
- If input contains "km" or "kilometers", convert to miles
- Formula: miles = km * 0.621371
- Always display as "X miles" in output

### Admin Configuration Flow
1. Admin runs `/settings channels`
2. Bot shows current channel mappings
3. Admin selects ride type to configure
4. Admin selects channel from dropdown
5. Bot updates database and confirms

### Deployment
- Use Railway.app for hosting
- PostgreSQL database on Railway
- Environment variables for sensitive data
- Automatic deployment from GitHub

## Development Priority
1. Basic bot setup and command registration
2. Ride creation with database storage
3. Channel configuration for admins
4. Channel routing and embed formatting
5. Reaction-based participation
6. My rides calendar command
7. All group rides calendar
8. Notification system

## Error Handling
- Validate all user inputs
- Check admin permissions for settings
- Provide helpful error messages
- Log errors for debugging
- Graceful fallbacks for failed operations
- Never expose internal errors to users