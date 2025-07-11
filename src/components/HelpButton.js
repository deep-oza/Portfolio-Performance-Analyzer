import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { PortfolioContext } from '../contexts/PortfolioContext';
import './HelpButton.css';

const HelpButton = () => {
  const { setHelpModalVisible } = useContext(PortfolioContext);
  
  const showHelpModal = () => {
    setHelpModalVisible(true);
  };
  
  return (
    <button className="help-button" onClick={showHelpModal} data-tour="help-button">
      <FontAwesomeIcon icon={faQuestionCircle} />
    </button>
  );
};

export default HelpButton; 