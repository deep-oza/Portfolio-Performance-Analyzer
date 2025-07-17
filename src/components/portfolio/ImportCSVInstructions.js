// ImportCSVInstructions.jsx
import React, { useState } from 'react';
import './ImportCSVInstructions.css';
// eslint-disable-next-line
import { FileText, Download, Upload, AlertCircle, CheckCircle, X, ChevronDown, ChevronRight } from 'lucide-react';

const ImportCSVInstructions = ({ onClose }) => {
  const [expandedSection, setExpandedSection] = useState('guide');

  const handleDownloadSample = () => {
    // Add your download logic here
    console.log('Downloading sample CSV...');
  };

  const handleCancel = () => {
    // Add your cancel logic here
    console.log('Upload cancelled');
    if (onClose) onClose();
  };

  const handleUpload = () => {
    // Add your upload logic here
    console.log('Starting upload...');
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const requiredColumns = [
    { name: 'symbol', alternatives: 'stock, ticker, scrip' },
    { name: 'qty', alternatives: 'quantity, shares, units, holding' },
    { name: 'avg price', alternatives: 'average price, buy price, purchase price, cost' }
  ];

  const optionalColumns = ['name', 'purchase date', 'realized gain', 'dividend'];

  const tips = [
    'Verify data accuracy before uploading',
    'Missing data may result in incomplete analysis',
    'File must be in .csv format (comma or tab separated)',
    'Maximum file size: 10MB'
  ];

  return (
    <div className="importcsv-overlay" onClick={handleCancel}>
      <div className="importcsv-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="importcsv-header">
          <div className="importcsv-header-content">
            <div className="importcsv-icon-container">
              <Upload size={20} color="white" />
            </div>
            <div>
              <h2 className="importcsv-header-title">Import Portfolio</h2>
              <p className="importcsv-header-subtitle">Upload CSV file</p>
            </div>
          </div>
          <button
            className="importcsv-close-button"
            onClick={handleCancel}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="importcsv-scrollable-content">
          <div className="importcsv-content">
            {/* Quick Actions */}
            <div className="importcsv-quick-actions">
              <button
                className="importcsv-action-button importcsv-download-button"
                onClick={handleDownloadSample}
              >
                <Download size={16} />
                <span>Sample CSV</span>
              </button>
              <div className="importcsv-action-button importcsv-status-button">
                <CheckCircle size={16} />
                <span>CSV Ready</span>
              </div>
            </div>

            {/* How to Import */}
            <div className="importcsv-collapsible-section">
              <button
                className="importcsv-section-header"
                onClick={() => toggleSection('guide')}
              >
                <div className="importcsv-section-header-content">
                  <FileText size={16} color="#4b5563" />
                  <span className="importcsv-section-title">How to Import</span>
                </div>
                {expandedSection === 'guide' ? (
                  <ChevronDown size={16} color="#4b5563" />
                ) : (
                  <ChevronRight size={16} color="#4b5563" />
                )}
              </button>
              {expandedSection === 'guide' && (
                <div className="importcsv-section-content">
                  <div className="importcsv-step-container">
                    <div className="importcsv-step-number">1</div>
                    <p className="importcsv-step-text">Download sample CSV for reference</p>
                  </div>
                  <div className="importcsv-step-container">
                    <div className="importcsv-step-number">2</div>
                    <p className="importcsv-step-text">Include all required columns in your file</p>
                  </div>
                  <div className="importcsv-step-container">
                    <div className="importcsv-step-number">3</div>
                    <p className="importcsv-step-text">Upload and analyze your portfolio</p>
                  </div>
                </div>
              )}
            </div>

            {/* Required Columns */}
            <div className="importcsv-collapsible-section">
              <button
                className="importcsv-section-header"
                onClick={() => toggleSection('required')}
              >
                <div className="importcsv-section-header-content">
                  <CheckCircle size={16} color="#16a34a" />
                  <span className="importcsv-section-title">Required Columns</span>
                </div>
                {expandedSection === 'required' ? (
                  <ChevronDown size={16} color="#4b5563" />
                ) : (
                  <ChevronRight size={16} color="#4b5563" />
                )}
              </button>
              {expandedSection === 'required' && (
                <div className="importcsv-section-content">
                  {requiredColumns.map((col, index) => (
                    <div key={index} className="importcsv-required-column">
                      <div className="importcsv-column-name">{col.name}</div>
                      <div className="importcsv-column-alternatives">Also accepts: {col.alternatives}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Optional Columns */}
            <div className="importcsv-collapsible-section">
              <button
                className="importcsv-section-header"
                onClick={() => toggleSection('optional')}
              >
                <div className="importcsv-section-header-content">
                  <div className="importcsv-optional-icon"></div>
                  <span className="importcsv-section-title">Optional Columns</span>
                </div>
                {expandedSection === 'optional' ? (
                  <ChevronDown size={16} color="#4b5563" />
                ) : (
                  <ChevronRight size={16} color="#4b5563" />
                )}
              </button>
              {expandedSection === 'optional' && (
                <div className="importcsv-section-content">
                  <p className="importcsv-step-text importcsv-optional-desc">For enhanced analysis:</p>
                  <div className="importcsv-optional-columns-grid">
                    {optionalColumns.map((col, index) => (
                      <div key={index} className="importcsv-optional-column">
                        {col}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="importcsv-collapsible-section">
              <button
                className="importcsv-section-header"
                onClick={() => toggleSection('tips')}
              >
                <div className="importcsv-section-header-content">
                  <div className="importcsv-tip-icon"></div>
                  <span className="importcsv-section-title">Import Tips</span>
                </div>
                {expandedSection === 'tips' ? (
                  <ChevronDown size={16} color="#4b5563" />
                ) : (
                  <ChevronRight size={16} color="#4b5563" />
                )}
              </button>
              {expandedSection === 'tips' && (
                <div className="importcsv-section-content">
                  {tips.map((tip, index) => (
                    <div key={index} className="importcsv-tip">
                      <div className="importcsv-tip-bullet"></div>
                      <p className="importcsv-tip-text">{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Warning */}
            <div className="importcsv-warning">
              <div className="importcsv-warning-content">
                <AlertCircle size={20} color="#d97706" style={{marginTop: '2px', flexShrink: 0}} />
                <div>
                  <div className="importcsv-warning-title">Important Notice</div>
                  <p className="importcsv-warning-text">
                    This will replace your current portfolio data. Backup existing data if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="importcsv-footer">
          <div className="importcsv-footer-text">
            <p>Ready to proceed?</p>
          </div>
          <div className="importcsv-footer-buttons">
            <button
              className="importcsv-cancel-button"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="importcsv-upload-button"
              onClick={handleUpload}
            >
              <Upload size={16} />
              Upload CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportCSVInstructions;