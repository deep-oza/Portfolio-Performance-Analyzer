import React, { useContext, useEffect, useCallback } from 'react';
import { PortfolioContext } from '../../contexts/PortfolioContext';
import './ConfirmModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const ConfirmModal = () => {
  const { modalConfig, hideModal } = useContext(PortfolioContext);
  const { 
    visible, 
    title, 
    message, 
    confirmText, 
    cancelText, 
    confirmButtonClass,
    onConfirm, 
    onCancel, 
    showCancel 
  } = modalConfig;
  
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
    hideModal();
  }, [onCancel, hideModal]);
  
  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && visible) {
        handleCancel();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, handleCancel]);
  
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    hideModal();
  };
  
  const handleOutsideClick = (e) => {
    if (e.target.className === 'modal-overlay active') {
      handleCancel();
    }
  };
  
  if (!visible) {
    return null;
  }
  
  return (
    <div 
      id="modalOverlay" 
      className="modal-overlay active" 
      onClick={handleOutsideClick}
    >
      <div className="modal-container pro-modal confirm-modal-pro-modal">
        {/* Header */}
        <div className="pro-modal-header confirm-modal-header">
          <span className="pro-modal-icon confirm-modal-icon" aria-hidden="true">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </span>
          <div>
            <h3 id="modalTitle" className="modal-title pro-modal-title confirm-modal-title">{title}</h3>
          </div>
        </div>
        {/* Body */}
        <div className="pro-modal-body confirm-modal-body">
          {typeof message === 'string' ? (
            <p id="modalMessage" className="modal-message pro-modal-message">{message}</p>
          ) : (
            <div id="modalMessage" className="modal-message pro-modal-message">{message}</div>
          )}
        </div>
        {/* Footer */}
        <div className="pro-modal-footer confirm-modal-footer">
          <div className="modal-actions pro-modal-actions confirm-modal-actions">
            {showCancel !== false && (
              <button 
                id="modalCancel" 
                className="btn btn-secondary pro-modal-btn" 
                onClick={handleCancel}
              >
                {cancelText || 'Cancel'}
              </button>
            )}
            <button 
              id="modalConfirm" 
              className={`btn pro-modal-btn ${confirmButtonClass || 'btn-primary'}`} 
              onClick={handleConfirm}
            >
              {confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 