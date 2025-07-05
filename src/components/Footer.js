import React, { useState } from 'react';
import ReactGA from 'react-ga';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt } from '@fortawesome/free-solid-svg-icons';

const PrivacyPolicyModal = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="modal-overlay" style={{ display: 'flex', zIndex: 11000 }} onClick={e => { if (e.target.className === 'modal-overlay') onClose(); }}>
      <div className="modal-container" style={{ maxWidth: 600, width: '90%', borderRadius: 14, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.18)' }}>
        {/* Header with gradient and icon */}
        <div style={{
          background: 'linear-gradient(135deg, #2563eb, #1e40af)',
          padding: '24px 32px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14
        }}>
          <FontAwesomeIcon icon={faShieldAlt} style={{ fontSize: 32, color: 'white' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: 0.5 }}>Privacy Policy</h3>
            <div style={{ fontSize: 15, opacity: 0.92 }}>Your privacy and data security is important to us.</div>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: 22,
              cursor: 'pointer',
              padding: 0
            }}
            aria-label="Close"
            title="Close"
          >
            ×
          </button>
        </div>
        {/* Content */}
        <div className="modal-content" style={{ padding: '32px 32px 24px 32px', background: '#fff', color: '#222', fontSize: 16 }}>
          <p style={{ marginBottom: 18 }}>
            This app uses Google Analytics to track usage statistics. No personal information is collected unless explicitly provided by you.
          </p>
          <ul style={{ marginBottom: 18, paddingLeft: 22 }}>
            <li style={{ marginBottom: 8 }}>We collect <b>anonymous usage data</b> to improve the app experience.</li>
            <li style={{ marginBottom: 8 }}>No personal or financial data is sent to any server.</li>
            <li style={{ marginBottom: 8 }}>All portfolio data is <b>stored locally</b> in your browser.</li>
            <li style={{ marginBottom: 8 }}>You can clear your data at any time using the app controls.</li>
            <li style={{ marginBottom: 8 }}>For more details, contact the developer.</li>
          </ul>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 18 }}>
            By using this app, you consent to the collection of anonymous usage data for analytics purposes only.
          </div>
          <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button className="btn btn-primary" onClick={onClose} style={{ minWidth: 120, fontWeight: 600, fontSize: 15 }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);

  const openPrivacyPolicy = () => {
    ReactGA.event({
      category: 'User',
      action: 'Viewed Privacy Policy'
    });
    setShowPrivacy(true);
  };

  return (
    <div className="footer">
      <PrivacyPolicyModal visible={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <div className="footer-sections">
        <div className="footer-section">
          <h4>Instructions</h4>
          <p>
            Enter current market prices in the
            "Current Price" column and click "Calculate All Metrics" to see CAGR
            and performance analysis.
          </p>
        </div>
        
        <div className="footer-section">
          <h4>Metrics Explained</h4>
          <p>
            <strong>Return % Since Purchase:</strong> Simple return percentage
            based on unrealized gain/loss only
          </p>
          <p>
            <strong>CAGR:</strong> Compound Annual Growth Rate based on
            unrealized gain/loss only
          </p>
          <p>
            <strong>Overall Return:</strong> Total portfolio return percentage
            based on unrealized gain/loss only
          </p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p className="footer-links">
          <button onClick={openPrivacyPolicy} className="link-button">
            Privacy Policy
          </button>
        </p>
        <p className="copyright">
          © {new Date().getFullYear()} Portfolio Performance Analyzer
        </p>
      </div>
    </div>
  );
};

export default Footer; 