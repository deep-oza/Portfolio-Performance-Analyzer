import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { PortfolioContext } from '../../contexts/PortfolioContext';

const SearchFilterBar = () => {
  const { 
    portfolioData,
    searchTerm, 
    setSearchTerm, 
    performanceFilter, 
    setPerformanceFilter 
  } = useContext(PortfolioContext);
  
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
    <div className="search-filter-container">
      <div className="search-box">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input 
          type="text" 
          id="stockSearch" 
          className="search-input" 
          placeholder="Search stocks..." 
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button className="btn btn-sm" id="clearSearch" onClick={clearSearch}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
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
        
        <button className="btn btn-sm" onClick={handleUpdateAll}>
          <FontAwesomeIcon icon={faSyncAlt} /> Update All
        </button>
      </div>
    </div>
  );
};

export default SearchFilterBar; 