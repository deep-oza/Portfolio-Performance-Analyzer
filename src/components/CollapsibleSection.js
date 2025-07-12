import React, { useState } from 'react';
import './CollapsibleSection.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const CollapsibleSection = ({ title, icon, children, defaultExpanded = false, expanded, onToggle }) => {
  // If expanded is provided, use it (controlled), else use internal state
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = typeof expanded === 'boolean' ? expanded : internalExpanded;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  };

  return (
    <div className={`collapsible-section${isExpanded ? ' expanded' : ''}`}> 
      <button className="collapsible-header" onClick={handleToggle} aria-expanded={isExpanded}>
        <span className="collapsible-icon">{icon}</span>
        <span className="collapsible-title">{title}</span>
        <span className="collapsible-chevron">
          <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} />
        </span>
      </button>
      <div className="collapsible-content" style={{ display: isExpanded ? 'block' : 'none' }}>
        {children}
      </div>
    </div>
  );
};

export default CollapsibleSection; 