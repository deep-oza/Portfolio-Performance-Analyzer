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
      <div className="modal-container" style={{ maxWidth: 600, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header" style={{ padding: '2rem 2rem 0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 id="modalTitle" className="modal-title" style={{ margin: 0 }}>{title}</h3>
          <button 
            className="modal-close-btn" 
            onClick={handleCancel}
            aria-label="Close"
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
        {/* Body */}
        <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '2rem' }}>
          <p id="modalMessage" className="modal-message" dangerouslySetInnerHTML={{ __html: message }} />
        </div>
        {/* Footer */}
        <div className="modal-footer" style={{ padding: '1.5rem 2rem', borderTop: '1px solid #eee', background: 'var(--bg-card)', position: 'sticky', bottom: 0, zIndex: 2 }}>
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