import React, { useContext, useEffect, useCallback } from 'react';
import { PortfolioContext } from '../../contexts/PortfolioContext';

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
      <div className="modal-container">
        <div className="modal-content">
          <h3 id="modalTitle" className="modal-title">{title}</h3>
          <p id="modalMessage" className="modal-message">{message}</p>
          <div className="modal-actions">
            {showCancel !== false && (
              <button 
                id="modalCancel" 
                className="btn btn-secondary" 
                onClick={handleCancel}
              >
                {cancelText || 'Cancel'}
              </button>
            )}
            <button 
              id="modalConfirm" 
              className={`btn ${confirmButtonClass || 'btn-danger'}`} 
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