# Technical Specification

## Stack
- React (Vite)
- Tailwind CSS (for styling)
- Recharts (for the visualization)
- Axios (for API requests)
- Lucide-React (for icons)

## API Endpoints
1. **Bitcoin:** CoinGecko
   - URL: `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7`
2. **Asteroids:** NASA NeoWs
   - URL: `https://api.nasa.gov/neo/rest/v1/feed?start_date={START}&end_date={END}&api_key=DEMO_KEY`
   - *Note:* The NASA API returns an object keyed by date strings. These must be flattened into an array.

## Requirements
- Create a custom hook `useCosmicData` to fetch and merge these two data sources by date.
- Use `recharts` <ResponsiveContainer> to ensure the chart fits mobile screens.