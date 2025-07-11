import React, { useContext, useEffect, useCallback } from 'react';
import { PortfolioContext } from '../../contexts/PortfolioContext';
import './ConfirmModal.css';

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
      <div className="modal-container" style={{ maxWidth: 600, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header" style={{ padding: '32px 32px 0 32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h3 id="modalTitle" className="modal-title" style={{ margin: 0 }}>{title}</h3>
        </div>
        {/* Body */}
        <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '32px' }}>
          {typeof message === 'string' ? (
            <p id="modalMessage" className="modal-message" dangerouslySetInnerHTML={{ __html: message }} />
          ) : (
            <div id="modalMessage" className="modal-message">{message}</div>
          )}
        </div>
        {/* Footer */}
        <div className="modal-footer" style={{ padding: '24px 32px', borderTop: '1px solid #eee', background: 'var(--bg-card)', position: 'sticky', bottom: 0, zIndex: 2 }}>
          <div className="modal-actions" style={{ margin: 0 }}>
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