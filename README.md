# Portfolio Holdings React

A React application for tracking and analyzing your stock portfolio. This project includes real-time stock price data integration with the Twelve Data API.

## Features

- Track your stock portfolio with performance metrics
- Import/Export portfolio data via CSV
- Real-time stock price data from Twelve Data API
- Fetch Last Traded Price (LTP) for Indian stocks (NSE)
- Dark/Light theme toggle
- Responsive design for desktop and mobile

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- NPM (v6 or higher)
- Twelve Data API key (get one at [https://twelvedata.com/](https://twelvedata.com/))

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/portfolio_holdings_react.git
   cd portfolio_holdings_react
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and add your Twelve Data API key:
   ```
   REACT_APP_TWELVE_API_KEY=your_api_key_here
   ```

4. Start the development server
   ```bash
   npm start
   ```

## Twelve Data API Integration

This project uses the Twelve Data API to fetch real-time stock quotes. The integration has the following features:

- **StockLTPCard Component**: A dedicated component that allows users to search for any NSE stock by symbol and view its Last Traded Price (LTP), name, and percentage change.

- **Batch Price Updates**: The app can fetch prices for all stocks in your portfolio at once.

- **API Key Management**: API key is stored in the `.env` file to keep it secure.

- **Error Handling**: Graceful error handling for API errors and loading states.

- **Stock Symbol Format**: Uses the format `SYMBOL:NS` for NSE stocks (e.g., TCS:NS, INFY:NS).

### Usage

1. Use the StockLTPCard component to search for individual stock quotes
2. Use the "Refresh Prices" button in the Control Panel to update all portfolio stock prices at once
3. Automatically fetches prices when the app loads or when new stocks are added

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

## Learn More

To learn more about the technologies used in this project:

- [React](https://reactjs.org/)
- [Twelve Data API](https://twelvedata.com/docs)
- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
