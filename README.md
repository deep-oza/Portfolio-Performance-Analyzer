# Portfolio Performance Analyzer

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

## Professional UI/UX

- **Modern Design System:** Utilizes a clean, contemporary design language with consistent color palettes, spacing, and typography.
- **Component-Based Architecture:** All UI elements are modular React components, styled for clarity and usability.
- **Accessibility:** Keyboard navigation, ARIA labels, and high-contrast themes ensure inclusivity for all users.
- **Intuitive Interactions:** Drag-and-drop, in-place editing, tooltips, and modals provide a smooth, frictionless workflow.
- **Visual Feedback:** Real-time updates, loading indicators, and confirmation dialogs keep users informed and confident.
- **Technologies Used:**
  - React 18
  - FontAwesome for icons
  - Recharts for analytics and data visualization
  - Custom CSS (no inline styles) for maintainable, scalable theming

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

### Sample CSV
A sample portfolio CSV is provided at `public/sample_portfolio.csv` for import/export reference.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
