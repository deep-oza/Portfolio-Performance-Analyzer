import React, { useContext, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { PortfolioContext } from '../../contexts/PortfolioContext';
import './SearchFilterBar.css';

const SearchFilterBar = () => {
  const { 
    portfolioData,
    searchTerm, 
    setSearchTerm, 
    performanceFilter, 
    setPerformanceFilter 
  } = useContext(PortfolioContext);
  
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Only show if there's data
  if (!portfolioData || portfolioData.length === 0) {
    return null;
  }
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (e) => {
    setPerformanceFilter(e.target.value);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
    setPerformanceFilter('all');
  };
  
  const handleUpdateAll = () => {
    // This would trigger recalculation of all metrics
    // Handled by the table component via context
  };
  
  return (
    <div className="search-filter-container" data-tour="search-filter-bar">
      <div className="search-box">
        <FontAwesomeIcon 
          icon={faSearch} 
          className="search-icon" 
        />
        <input 
          type="text" 
          id="stockSearch" 
          className="search-input" 
          placeholder="Search stocks..." 
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        {(searchTerm || isSearchFocused) && (
          <button 
            className="btn btn-sm search-clear-btn" 
            id="clearSearch" 
            onClick={clearSearch}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
      
      <div className="filter-options">
        <select 
          id="performanceFilter" 
          className="filter-select" 
          value={performanceFilter}
          onChange={handleFilterChange}
        >
          <option value="all">All Stocks</option>
          <option value="gainers">Gainers Only</option>
          <option value="losers">Losers Only</option>
        </select>
      </div>
    </div>
  );
};

export default SearchFilterBar; 