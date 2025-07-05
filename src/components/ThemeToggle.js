import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { PortfolioContext } from '../contexts/PortfolioContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(PortfolioContext);
  
  return (
    <button className="theme-toggle" onClick={toggleTheme} data-tour="theme-toggle">
      <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
    </button>
  );
};

export default ThemeToggle; 