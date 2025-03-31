# CrunchyrollWatch2Gether

A browser extension that enables synchronized Crunchyroll video playback with friends, making it easy to watch anime together even when physically apart.

## Features

- 🎥 Real-time video playback synchronization
- 👥 Lobby system for group watching
- 🔄 Automatic episode synchronization
- 🎮 Simple and intuitive controls
- 🌐 Cross-browser compatibility (Chrome-based browsers)

## Architecture

The project consists of two main components:

1. **Browser Extension (Client)**
   - Built with TypeScript using WXT framework
   - SignalR client for real-time communication
   - Seamless integration with Crunchyroll's video player

2. **Backend Server**
   - Built with C# (.NET 9.0)
   - SignalR Hub for managing connections and synchronization
   - Cross-platform compatibility

## Installation

### Development Setup

1. **Backend Server**
   ```bash
   cd CrunchyrollWatch2Gether
   dotnet restore
   dotnet run
   ```

2. **Browser Extension**
   ```bash
   cd Client/wxt-dev-wxt
   npm install
   npm run dev:chrome   # For development
   # or
   npm run build:chrome # For production build
   ```

### Installing the Extension

#### Using Pre-built Extension
1. Download the latest release
2. Open Chrome/Edge and navigate to `chrome://extensions/`
3. Enable "Developer Mode"
4. Click "Load unpacked" and select the extension directory

#### Building from Source
1. Follow the development setup steps above
2. Build the extension using `npm run build:chrome`
3. Load the extension from the `.output` directory

## Usage

1. Install the extension
2. Navigate to any Crunchyroll series or episode
3. Click the extension icon to:
   - Create a new watch party
   - Join an existing party using a lobby ID
   - Share the lobby ID with friends

## Development

### Server Commands
```bash
dotnet run --project CrunchyrollWatch2Gether
```

### Extension Commands
```bash
npm run dev        # Start development mode
npm run build     # Build for production
npm run zip       # Create distribution package
```

## Self-Hosting

To self-host the SignalR server:

1. Modify the SignalR URL in `Client/wxt-dev-wxt/components/services/VideoSyncService.ts`
2. Build and deploy the .NET application
3. Build the extension with your custom SignalR endpoint

## Requirements

- .NET 9.0 SDK
- Node.js 18+ and npm
- Chrome/Chromium-based browser

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)