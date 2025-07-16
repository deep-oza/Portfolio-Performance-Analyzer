# Portfolio Performance Analyzer

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

A professional, modern web application for tracking and analyzing your stock portfolio performance with an intuitive, visually appealing user interface.

## Overview

**Portfolio Performance Analyzer** is a feature-rich, React-based platform designed for investors who demand both powerful analytics and a seamless, professional user experience. The application combines robust portfolio management tools with a polished, responsive UI, ensuring accessibility and ease of use across all devices.

## Key Features

- **Multi-Portfolio Management:** Organize investments by strategy, account, or goal with easy portfolio creation, switching, and deletion.
- **Advanced Performance Metrics:** Instantly calculate CAGR, total returns, realized/unrealized gains, and more.
- **Professional Analytics Dashboard:** Interactive charts and visualizations for deep insights (CAGR, returns, gainers/losers, holding periods).
- **CSV Import/Export:** Effortlessly migrate data using flexible CSV tools (see `public/sample_portfolio.csv`).
- **Real-Time Stock Quotes:** Fetch live prices from Yahoo Finance for accurate, up-to-date analysis.
- **Customizable Table:** Show/hide, reorder, and sort columns; search and filter stocks with ease.
- **Guided Onboarding & Help:** Built-in guided tour, contextual help, and detailed instructions for new and advanced users.
- **Privacy-First:** All data is securely stored in your browser (localStorage); no server-side storage or tracking.
- **Dark/Light Mode:** Instantly toggle between elegant light and dark themes for optimal viewing comfort.
- **Mobile-First Responsive Design:** Fully responsive layout and touch-friendly controls for desktop, tablet, and mobile.

## Technologies Used

- **React 18** – UI library for building interactive interfaces
- **Recharts** – Data visualization and analytics charts
- **FontAwesome** – Iconography
- **@reactour/tour** – Guided tours and onboarding
- **Custom CSS** – Modern, maintainable styling (no inline styles)
- **Yahoo Finance API (via AllOrigins CORS proxy)** – Real-time stock price data
- **Jest & React Testing Library** – (Optional) Unit and integration testing

## Accessibility

Portfolio Performance Analyzer is designed with accessibility and inclusivity in mind:

- **Keyboard Navigation:** All interactive elements (buttons, forms, modals, tables) are accessible via keyboard (Tab, Enter, Space, Arrow keys).
- **ARIA Labels:** Important UI elements include ARIA attributes for improved screen reader support.
- **Color Contrast:** The app uses high-contrast color palettes and supports both light and dark themes for readability.
- **Responsive Design:** The layout adapts to all screen sizes, ensuring usability on desktop, tablet, and mobile devices.
- **Focus Indicators:** Clear focus outlines help users track navigation.
- **Semantic HTML:** Proper use of headings, lists, and roles for better accessibility.
- **Accessible Modals:** Modals can be closed with Escape and are focus-trapped.

## Project Structure

```
Portfolio-Performance-Analyzer/
├── public/                  # Static assets and the sample CSV for import/export
│   └── sample_portfolio.csv
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── modals/          # Modal dialogs (Help, Confirm)
│   │   └── portfolio/       # Portfolio-specific components (table, forms, analytics, etc.)
│   ├── contexts/            # React Context for global state management
│   ├── hooks/               # Custom React hooks (e.g., for stock quotes)
│   ├── utils/               # Utility functions (CSV import/export, stock data fetching)
│   ├── styles.css           # Global styles and theme variables
│   ├── App.js               # Main application component
│   └── index.js             # Entry point
├── package.json             # Project metadata and dependencies
├── README.md                # Project documentation
└── server.js                # (Optional) Backend/server entry (if used)
```

**Key Directories and Files:**

- **public/**: Static files, favicon, manifest, and sample CSV for portfolio import/export.
- **src/components/**: All React UI components, organized by feature and type.
- **src/contexts/**: Application-wide state management using React Context API.
- **src/hooks/**: Custom hooks for encapsulating reusable logic.
- **src/utils/**: Utility modules for CSV handling and stock data fetching.
- **src/styles.css**: Global CSS variables and base styles for theming.
- **App.js / index.js**: Main app logic and entry point.

## Main Components

- **SummaryCards:** At-a-glance portfolio totals and key metrics
- **ControlPanel:** Import/export, add stocks, refresh prices, clear portfolio
- **StockForm:** Add/edit stock details with validation and live price lookup
- **PortfolioTable:** Editable, sortable, and filterable holdings table
- **AnalyticsDashboard:** Interactive charts for performance analysis
- **PortfolioSelector:** Manage multiple portfolios with ease
- **SearchFilterBar:** Powerful search and filter for large portfolios
- **StockLTPCard:** Real-time stock quote widget
- **ThemeToggle:** One-click dark/light mode switch
- **HelpButton/HelpModal:** In-app help, onboarding, and guided tour
- **Footer:** Quick start, metrics explanation, privacy info

## Analytics & Visualizations

The Analytics Dashboard offers:
- **CAGR by Stock:** Visualize annualized returns per holding
- **Return % per Stock:** Compare total return percentages
- **Invested vs Current Value:** Bar charts for capital allocation
- **Top Gainers & Losers:** Instantly spot best/worst performers
- **Short/Long Term Holdings:** Track holding periods for tax and strategy

## State Management & Data Privacy

- **React Context API:** Centralized state for portfolios, prices, theme, filters, and UI state
- **Local Storage:** All data is saved locally for privacy and offline access
- **No External Data Storage:** Your portfolio never leaves your device

## Utilities

- **CSV Utilities (`src/utils/csvUtils.js`):**
  - Import/export with robust validation and flexible mapping
  - Download full portfolio as CSV
- **Stock Utilities (`src/utils/stockUtils.js`):**
  - Real-time price fetching and batch operations

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Troubleshooting
- If you encounter issues with dependencies, try deleting `node_modules` and `package-lock.json` (or `yarn.lock`), then reinstall:
  ```
  rm -rf node_modules package-lock.json
  npm install
  ```
- Ensure you are using a supported Node.js version (v14 or higher).
- For issues with real-time stock data, check your internet connection and browser CORS settings.

## Usage

### Quick Start Guide

1. **Add Your Stocks:**
   - Click “Add New Stock” or import a CSV file using the “Import Portfolio (CSV)” button in the Control Panel.
   - Enter stock symbol, quantity, average price, and purchase date.
2. **View and Edit Portfolio:**
   - Your stocks will appear in the portfolio table. Edit values directly or use the table controls.
   - Use the search bar and filters to quickly find stocks.
3. **Fetch Real-Time Prices:**
   - Click “Refresh Prices” to update all stock prices from Yahoo Finance.
   - Use the Stock Quote widget for individual lookups.
4. **Analyze Performance:**
   - Click “Show Analytics” to view interactive charts and performance metrics.
5. **Export or Backup:**
   - Use “Export Data” to download your portfolio as a CSV file.
6. **Switch Portfolios:**
   - Use the Portfolio Selector to create, switch, or delete portfolios.
7. **Get Help:**
   - Click the Help button or start the guided tour for tips and instructions.

## FAQ

**Where is my data stored?**  
All your portfolio data is securely stored in your browser’s localStorage. No data is sent to any server or third party.

**How do I reset my portfolio?**  
Use the “Clear Portfolio” button in the Control Panel to remove all stocks from the current portfolio. To reset all portfolios, you can clear your browser’s localStorage or use the app’s UI to delete portfolios individually.

**Can I use this app offline?**  
Yes, most features work offline except for real-time stock price lookups, which require an internet connection.

**How do I import/export my portfolio?**  
Use the “Import Portfolio (CSV)” and “Export Data” buttons in the Control Panel. Refer to the provided sample CSV for the correct format.

**Is my data private?**  
Yes. All data remains on your device and is never uploaded or shared.

**How do I switch between light and dark mode?**  
Click the theme toggle button in the top-right corner to instantly switch between light and dark themes.

## License & Credits

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### Credits

- **Yahoo Finance** for real-time stock data (via public API)
- **FontAwesome** for icons
- **Recharts** for charting and analytics
- **@reactour/tour** for the guided tour experience
- **React** and the open-source community for foundational libraries
- Special thanks to all contributors and users who provide feedback and support
