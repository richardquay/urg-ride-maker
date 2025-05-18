# URG Ride Maker

A Discord bot for organizing and managing group bike rides, with support for locations, ride types, vibes, and more.

## Features

- Create and share ride events with custom locations, times, and vibes
- Supports multiple ride types (Road, Gravel, Mountain, Social, Virtual, Race)
- Weather integration (requires API key)
- Emoji reactions for RSVP
- Customizable drop styles and rollout times

## Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/richardquay/urg-ride-maker.git
   cd urg-ride-maker
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment variables:**
   - Create a `.env` file in the root directory.
   - Add your weather API key and any other required secrets:
     ```
     WEATHER_API_KEY=your_api_key_here
     ```

4. **Run the bot:**
   ```sh
   node index.js
   ```

## Configuration

- Edit `config/config.js` to customize default locations, ride types, vibes, and more.
- Add or modify Discord channel IDs as needed.

## Usage

- Use Discord slash commands to create and manage rides.
- React to ride posts with the appropriate emoji to RSVP.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

MIT (or specify your preferred license) 