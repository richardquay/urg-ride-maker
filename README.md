# URG Ride Maker Discord Bot

A Discord bot for organizing group cycling rides. This bot helps cycling communities manage and coordinate group rides through Discord.

## Features

- **Ride Creation**: Create cycling rides with detailed information including:
  - Ride type (Road, Gravel, Mountain, Social, Virtual)
  - Vibe (Spicy or Party)
  - Date and time
  - Start/End locations
  - Distance
  - Drop style
  - Route information

- **Channel Management**:
  - Automatic routing of rides to appropriate channels
  - Admin configuration of ride type channels
  - Organized ride categories

- **Participation System**:
  - Reaction-based participation tracking
  - Support for "Interested" and "Maybe" statuses
  - Real-time participant list updates

## Technical Stack

- **Language**: TypeScript
- **Framework**: Discord.js v14
- **Database**: PostgreSQL with Prisma ORM
- **Hosting**: Railway.app

## Prerequisites

- Node.js (version needed?)
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
CLIENT_ID=your_discord_application_id
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
- `npm run build` - Build the TypeScript code
- `npm run prisma:studio` - Open Prisma Studio for database management

## Commands

- `/create-ride` - Create a new cycling ride
- `/settings channels` - Configure ride type channels (Admin only)

## Questions for Project Owner

To make this README more complete, I need the following information:

1. What is the minimum Node.js version required?
2. Are there any specific PostgreSQL version requirements?
3. Are there any specific setup instructions for the Discord application?
4. Are there any specific permissions required for the bot?
5. Are there any deployment instructions specific to Railway.app?
6. Are there any contribution guidelines?
7. What is the license for this project?
8. Are there any specific environment variables needed beyond the ones listed?
9. Are there any known limitations or planned features?
10. Are there any specific testing instructions?

## License

[License information needed]

## Contributing

[Contribution guidelines needed] 