import React, { useState } from 'react';
import ReactGA from 'react-ga';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faUserSecret, 
  faDatabase, 
  faUserCheck, 
  faEnvelope,
  faCalculator,
  faChartLine,
  faPercentage,
  faClock,
  faArrowTrendUp,
  faInfoCircle,
  faPlus,
  faGithub,
  faLinkedin,
  faEnvelope as faEnvelopeSolid,
  faPlay,
  faCheckCircle,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import { faGithub as faGithubBrand, faLinkedin as faLinkedinBrand } from '@fortawesome/free-brands-svg-icons';
import './Footer.css';

const PrivacyPolicyModal = ({ visible, onClose }) => {
  // Get theme from body attribute
  const theme = document.body.getAttribute('data-theme') || 'light';
  const isDark = theme === 'dark';

  if (!visible) return null;
  return (
    <div className="modal-overlay" style={{ display: 'flex', zIndex: 11000 }} onClick={e => { if (e.target.className === 'modal-overlay') onClose(); }}>
      <div
        className="modal-container"
        style={{
          maxWidth: 650,
          width: '95%',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0,0,0,0.18)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card)',
        }}
      >
        {/* Header with gradient and icon, no X icon */}
        <div style={{
          background: isDark
            ? 'linear-gradient(135deg, #1e293b, #2563eb)'
            : 'linear-gradient(135deg, #2563eb, #1e40af)',
          padding: '28px 36px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16
        }}>
          <FontAwesomeIcon icon={faShieldAlt} style={{ fontSize: 36, color: 'white' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: 0.5, color: 'white' }}>Privacy Policy</h3>
            <div style={{ fontSize: 16, opacity: 0.92 }}>Your privacy and trust are our top priorities.</div>
          </div>
        </div>
        {/* Scrollable Content */}
        <div
          className="modal-content"
          style={{
            padding: '32px 36px 24px 36px',
            color: 'var(--text-main)',
            background: 'var(--bg-card)',
            fontSize: 17,
            lineHeight: 1.7,
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
          }}
        >
          <section style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 17, marginBottom: 10 }}>
              We are committed to protecting your privacy and ensuring transparency in how your data is handled. This policy explains what information we collect, how we use it, and your rights regarding your data on this website.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 600, margin: 0, color: '#2563eb' }}>
              <FontAwesomeIcon icon={faUserSecret} /> What We Collect
            </h4>
            <ul style={{ margin: '12px 0 0 22px', padding: 0 }}>
              <li>Anonymous usage data (e.g., page views, feature usage) via Google Analytics</li>
              <li>No personal, financial, or sensitive information is collected unless you explicitly provide it</li>
              <li>Your portfolio data is stored <b>only in your browser</b> and never sent to any server</li>
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 600, margin: 0, color: '#2563eb' }}>
              <FontAwesomeIcon icon={faDatabase} /> How We Use Data
            </h4>
            <ul style={{ margin: '12px 0 0 22px', padding: 0 }}>
              <li>To improve website features and user experience</li>
              <li>To understand general usage patterns (never individual behavior)</li>
              <li>We do <b>not</b> sell, share, or transfer your data to third parties</li>
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 600, margin: 0, color: '#2563eb' }}>
              <FontAwesomeIcon icon={faUserCheck} /> Your Rights & Choices
            </h4>
            <ul style={{ margin: '12px 0 0 22px', padding: 0 }}>
              <li>You can clear your portfolio and analytics data at any time using the website controls</li>
              <li>You may use browser privacy settings or extensions to block analytics if you wish</li>
              <li>We respect your privacy preferences at all times</li>
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 600, margin: 0, color: '#2563eb' }}>
              <FontAwesomeIcon icon={faEnvelope} /> Contact
            </h4>
            <div style={{ marginLeft: 2, fontSize: 16 }}>
              If you have any questions or concerns about your privacy, please contact the developer at <a href="mailto:ozadeep70@gmail.com" style={{ color: '#2563eb', textDecoration: 'underline' }}>ozadeep70@gmail.com</a>.
            </div>
          </section>

          <div style={{ fontSize: 14, color: isDark ? '#aaa' : '#666', marginBottom: 18, marginTop: 10 }}>
            By using this website, you consent to the collection of anonymous usage data for analytics purposes only. This policy may be updated from time to time.
          </div>
        </div>
        {/* Sticky Footer with Full-Width Big Close Button */}
        <div style={{
          background: 'var(--bg-card)',
          borderTop: isDark ? '1px solid #222b' : '1px solid #eee',
          padding: '18px 36px',
          display: 'flex',
          justifyContent: 'center',
          position: 'sticky',
          bottom: 0,
          zIndex: 2,
        }}>
          <button
            className="btn btn-primary"
            onClick={onClose}
            style={{
              width: '100%',
              maxWidth: 400,
              fontWeight: 700,
              fontSize: 20,
              padding: '18px 0',
              borderRadius: 10,
              letterSpacing: 1,
              boxShadow: isDark ? '0 2px 8px rgba(37,99,235,0.25)' : '0 2px 8px rgba(37,99,235,0.10)',
              transition: 'background 0.2s',
              background: 'linear-gradient(90deg, #2563eb 60%, #1e40af 100%)',
              color: '#fff',
              border: 'none',
            }}
          >
            Close
          </button>
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
    <footer className="footer">
      <PrivacyPolicyModal visible={showPrivacy} onClose={() => setShowPrivacy(false)} />
      
      {/* Main Footer Content */}
      <div className="footer-container">
        {/* Top Section - Features & Info */}
        <div className="footer-main">
          {/* How to Use Section */}
          <div className="footer-section">
            <div className="footer-section-header">
              <div className="footer-icon-wrapper">
                <FontAwesomeIcon icon={faCalculator} className="footer-icon" />
              </div>
              <div className="footer-section-title-wrapper">
                <h3 className="footer-section-title">
                  Getting Started
                </h3>
                <p className="footer-section-subtitle">Follow these simple steps to analyze your portfolio</p>
              </div>
            </div>
            
            <div className="footer-steps">
              <div className="footer-step">
                <div className="footer-step-number">1</div>
                <div className="footer-step-content">
                  <div className="footer-step-header">
                    <FontAwesomeIcon icon={faPlus} className="footer-step-icon" />
                    <span>Add Your Stocks</span>
                  </div>
                  <p className="footer-step-desc">
                    Use the "Add New Stock" button or import a CSV file containing symbol, quantity, average price, and purchase date.
                  </p>
                  <div className="footer-step-tip">
                    <FontAwesomeIcon icon={faLightbulb} className="footer-tip-icon" />
                    <span>Tip: You can also drag and drop CSV files directly onto the page</span>
                  </div>
                </div>
              </div>
              
              <div className="footer-step">
                <div className="footer-step-number">2</div>
                <div className="footer-step-content">
                  <div className="footer-step-header">
                    <FontAwesomeIcon icon={faChartLine} className="footer-step-icon step2" />
                    <span>Enter Current Prices</span>
                  </div>
                  <p className="footer-step-desc">
                    Click in the "Current Price" column and enter the latest market prices. Use "Refresh Prices" for automatic updates.
                  </p>
                  <div className="footer-step-tip">
                    <FontAwesomeIcon icon={faLightbulb} className="footer-tip-icon" />
                    <span>Tip: Prices update in real-time as you type</span>
                  </div>
                </div>
              </div>
              
              <div className="footer-step">
                <div className="footer-step-number">3</div>
                <div className="footer-step-content">
                  <div className="footer-step-header">
                    <FontAwesomeIcon icon={faArrowTrendUp} className="footer-step-icon step3" />
                    <span>View Real-Time Analysis</span>
                  </div>
                  <p className="footer-step-desc">
                    All metrics update automatically! See returns, CAGR, and performance analysis instantly as you enter prices.
                  </p>
                  <div className="footer-step-tip">
                    <FontAwesomeIcon icon={faCheckCircle} className="footer-tip-icon success" />
                    <span>All calculations happen instantly - no waiting required</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Performance Metrics Section */}
          <div className="footer-section">
            <div className="footer-section-header">
              <div className="footer-icon-wrapper metrics">
                <FontAwesomeIcon icon={faPercentage} className="footer-icon" />
              </div>
              <div className="footer-section-title-wrapper">
                <h3 className="footer-section-title">
                  Performance Metrics
                </h3>
                <p className="footer-section-subtitle">Understanding your portfolio's key performance indicators</p>
              </div>
            </div>
            
            <div className="footer-steps">
              <div className="footer-step">
                <div className="footer-step-number">1</div>
                <div className="footer-step-content">
                  <div className="footer-step-header">
                    <FontAwesomeIcon icon={faPercentage} className="footer-step-icon" />
                    <span>Average Return %</span>
                  </div>
                  <p className="footer-step-desc">
                    Portfolio-wide return calculated as: (Total Current Value - Total Invested) ÷ Total Invested × 100
                  </p>
                  <div className="footer-step-formula">
                    <strong>Formula:</strong> (Current Value - Invested Amount) ÷ Invested Amount × 100
                  </div>
                </div>
              </div>
              
              <div className="footer-step">
                <div className="footer-step-number">2</div>
                <div className="footer-step-content">
                  <div className="footer-step-header">
                    <FontAwesomeIcon icon={faChartLine} className="footer-step-icon step2" />
                    <span>Average CAGR</span>
                  </div>
                  <p className="footer-step-desc">
                    Weighted average Compound Annual Growth Rate across all holdings in your portfolio.
                  </p>
                  <div className="footer-step-formula">
                    <strong>Formula:</strong> Σ(Invested Amount × Individual CAGR) ÷ Σ(Invested Amount)
                  </div>
                  <div className="footer-step-note">
                    <strong>Requirements:</strong> Stocks held ≥90 days with valid prices<br/>
                    <strong>Limits:</strong> -100% to 200% per stock, -99.99% to 999,999% overall
                  </div>
                </div>
              </div>
              
              <div className="footer-step">
                <div className="footer-step-number">3</div>
                <div className="footer-step-content">
                  <div className="footer-step-header">
                    <FontAwesomeIcon icon={faClock} className="footer-step-icon step3" />
                    <span>Average Total Return</span>
                  </div>
                  <p className="footer-step-desc">
                    Comprehensive portfolio return including unrealized gains/losses, realized gains, and dividend income.
                  </p>
                  <div className="footer-step-formula">
                    <strong>Includes:</strong> Unrealized gains + Realized gains + Dividends
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Links & Copyright */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-links">
              <button onClick={openPrivacyPolicy} className="footer-link">
                Privacy Policy
              </button>
              <a href="mailto:ozadeep70@gmail.com" className="footer-link">
                <FontAwesomeIcon icon={faEnvelopeSolid} />
                Contact
              </a>
            </div>
            
            <div className="footer-social">
              <a href="https://github.com/deep-oza" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                <FontAwesomeIcon icon={faGithubBrand} />
              </a>
              <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                <FontAwesomeIcon icon={faLinkedinBrand} />
              </a>
            </div>
          </div>
          
          <div className="footer-copyright">
            <p>© {new Date().getFullYear()} Portfolio Performance Analyzer. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 