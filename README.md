# Cosmic Crypto Dashboard

A React-based web application that visualizes the correlation between Bitcoin's price movements and Near Earth Object (asteroid) activity.

## Features

- Real-time Bitcoin price tracking
- NASA asteroid data visualization
- Interactive charts showing historical trends
- Space-themed dark mode interface
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with dark theme
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Testing**: Jest + React Testing Library + fast-check (Property-Based Testing)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

### Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Building

Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── services/           # API service layers
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## API Integration

- **Bitcoin Data**: CoinGecko API
- **Asteroid Data**: NASA NeoWs API