# URG Ride Maker Discord Bot

A Discord bot for organizing group cycling rides. This bot helps cycling communities manage and coordinate group rides through Discord.

## Features

- **Ride Creation**: Create cycling rides with detailed information including:
  - Ride type (Road, Gravel, Mountain, Social, Virtual)
  - Vibe (🌶️ Spicy or 🎉 Party)
  - Date and time (with flexible input formats)
  - Start/End locations (with support for custom locations)
  - Distance (miles or kilometers)
  - Drop style (Drop, No Drop, Regroup)
  - Route information (Strava, RideWithGPS, etc.)
  - Custom notes and additional details

- **Channel Management**:
  - Automatic routing of rides to appropriate channels based on ride type
  - Pre-configured channels for different ride types
  - Organized ride categories with dedicated channels

- **Participation System**:
  - Reaction-based participation tracking (👍 for "I'm in", 🤔 for "Maybe")
  - Real-time participant list updates
  - Easy-to-use reaction system

## Technical Stack

- **Language**: JavaScript (Node.js)
- **Framework**: Discord.js v14
- **Database**: PostgreSQL with Prisma ORM
- **Hosting**: Railway.app

## Prerequisites

- Node.js v16 or higher
- PostgreSQL database
- Discord Bot Token
- Discord Application ID

## Installation

1. Clone the repository
```bash
git clone https://github.com/richardquay/URG-ride-maker.git
cd URG-ride-maker
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create a .env file with the following variables:
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_application_id
DATABASE_URL=your_postgresql_database_url
```

4. Set up the database
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Build and run the bot
```bash
npm run build
npm start
```

## Development

- `npm run dev` - Run in development mode with hot reload
- `npm run build` - Build the JavaScript code
- `npm run prisma:studio` - Open Prisma Studio for database management

## Commands

### `/create-ride`
Create a new cycling ride with the following options:

**Required Options:**
- `vibe`: The vibe of the ride (🌶️ Spicy or 🎉 Party)
- `type`: The type of ride (Road, Gravel, Mountain, Social, Virtual)
- `drop_style`: The drop style (Drop, No Drop, Regroup)
- `date`: The date of the ride (e.g., "tomorrow", "next Tuesday", "MM/DD")
- `meet_time`: When to arrive (e.g., "9:00 AM", "21:00")
- `start_location`: Where to meet (Angry Catfish, Northern Coffeeworks, Other)

**Optional Options:**
- `rollout_time`: Minutes after meet time to start (0-60 minutes)
- `end_location`: Where the ride ends (defaults to start location)
- `distance`: Distance in miles or kilometers (e.g., "20 miles" or "32 km")
- `route_source`: URL to route (Strava, RideWithGPS, etc.)
- `notes`: Additional notes for the ride

## Channel Configuration

The bot uses the following channel IDs for different ride types:
- Road: 1369666762601140295
- Gravel: 1369666794444296274
- Mountain: 1369666736424488990
- Social: 1370182475170582558
- Virtual: 1380541852360507473
- Race: 1380541994593419326

## Error Handling

The bot includes comprehensive error handling for:
- Database connection issues
- Discord API errors
- Input validation
- Timeout handling
- Permission issues

## Questions for Project Owner

To make this README more complete, I need the following information:

1. Are there any specific PostgreSQL version requirements?
2. Are there any specific setup instructions for the Discord application?
3. Are there any specific permissions required for the bot?
4. Are there any deployment instructions specific to Railway.app?
5. Are there any contribution guidelines?
6. What is the license for this project?
7. Are there any known limitations or planned features?
8. Are there any specific testing instructions?

## License

[License information needed]

## Contributing

[Contribution guidelines needed] 