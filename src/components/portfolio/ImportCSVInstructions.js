// ImportCSVInstructions.jsx
import React, { useState, useRef } from 'react';
import './ImportCSVInstructions.css';
import { importPortfolioCSV } from '../../utils/csvUtils';
// eslint-disable-next-line
import { FileText, Download, Upload, AlertCircle, CheckCircle, X, ChevronDown, ChevronRight, Loader2, FileDown, Columns, Upload as UploadIcon, FolderPlus, CheckCircle as CheckCircleIcon } from 'lucide-react';

const requiredColumns = [
  { name: 'symbol', alternatives: 'stock, ticker, scrip' },
  { name: 'qty', alternatives: 'quantity, shares, units, holding' },
  { name: 'avg price', alternatives: 'average price, buy price, purchase price, cost' }
];

const ImportCSVInstructions = ({ onClose, portfolios, importCSV, showMessage, showError, theme = 'light' }) => {
  const [step, setStep] = useState(1); // 1: upload, 2: portfolio select, 3: confirm
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null); // { portfolio, prices, warnings }
  const [parseError, setParseError] = useState('');
  const [portfolioId, setPortfolioId] = useState('');
  const [addNew, setAddNew] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState('');
  const [importError, setImportError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showHowToImport, setShowHowToImport] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [showRequiredFields, setShowRequiredFields] = useState(true);
  const fileInputRef = useRef();
  // Add state for the whole How to Import section collapse/expand
  const [showHowToImportSection, setShowHowToImportSection] = useState(false);

  // Step 1: File upload and parse
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setParseError('');
    setParsedData(null);
    setStep(1);
    if (!selectedFile) return;
    setIsParsing(true);
    try {
      const result = await importPortfolioCSV(selectedFile);
      setParsedData(result);
      setIsParsing(false);
      // Do NOT call setStep(2) here; let user click Next
      const keys = Object.keys(portfolios).filter(k => k !== 'default');
      setPortfolioId(keys[0] || '');
      setAddNew(keys.length === 0);
      setNewPortfolio('');
      setImportError('');
    } catch (err) {
      setParseError(err.message);
      setParsedData(null);
      setIsParsing(false);
      setStep(1);
    }
  };

  // Step 2: Portfolio selection/creation
  const handlePortfolioSelect = (e) => {
    if (e.target.value === '__add_new__') {
      setAddNew(true);
      setNewPortfolio('');
    } else {
      setPortfolioId(e.target.value);
      setAddNew(false);
      setNewPortfolio('');
    }
    setImportError('');
  };

  // Step 3: Confirm import
  const handleImport = async () => {
    setImportError('');
    setIsImporting(true);
    let finalPortfolioId = portfolioId;
    if (addNew) {
      if (!newPortfolio.trim()) {
        setImportError('Portfolio name is required.');
        setIsImporting(false);
        return;
      }
      if (Object.keys(portfolios).includes(newPortfolio.trim())) {
        setImportError('Portfolio already exists.');
        setIsImporting(false);
        return;
      }
      finalPortfolioId = newPortfolio.trim();
    }
    if (!finalPortfolioId) {
      setImportError('Portfolio name is required.');
      setIsImporting(false);
      return;
    }
    try {
      importCSV(parsedData, finalPortfolioId);
      let message = '✅ Imported portfolio from CSV!';
      if (parsedData.warnings && parsedData.warnings.length > 0) {
        message += '\n\nWarnings:\n' + parsedData.warnings.join('\n');
      }
      showMessage('Import Successful', message);
      setIsImporting(false);
      if (onClose) onClose();
    } catch (err) {
      setImportError(err.message || 'Import failed.');
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    if (onClose) onClose();
  };

  // Download sample CSV
  const handleDownloadSample = () => {
    const link = document.createElement('a');
    link.href = '/sample_portfolio.csv';
    link.download = 'sample_portfolio.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stepperSteps = [
    {
      label: 'Download Sample CSV',
      icon: <FileDown size={18} />,
      content: (
        <div>
          Download the sample CSV and use it as a template for your data.
        </div>
      ),
    },
    {
      label: 'Prepare Required Columns',
      icon: <Columns size={18} />,
      content: (
        <div>
          <div className="importcsv-howto-step-desc">Your file must include these columns:</div>
          <ul className="importcsv-required-columns-grid">
            {requiredColumns.map((col) => (
              <li key={col.name} className="importcsv-required-column">
                <span className="importcsv-column-name">
                  <FileText size={14} style={{ marginRight: 6 }} />
                  {col.name}
                </span>
                <span className="importcsv-column-alternatives">(e.g., {col.alternatives})</span>
              </li>
            ))}
          </ul>
          <div className="importcsv-howto-note">Column names are case-insensitive. Extra columns are ignored.</div>
        </div>
      ),
    },
    {
      label: 'Upload Your CSV',
      icon: <UploadIcon size={18} />,
      content: (
        <div>
          Upload your CSV file and preview your data before importing.
        </div>
      ),
    },
    {
      label: 'Select/Create Portfolio',
      icon: <FolderPlus size={18} />,
      content: (
        <div>
          Choose an existing portfolio or create a new one to import your stocks.
        </div>
      ),
    },
    {
      label: 'Confirm and Import',
      icon: <CheckCircleIcon size={18} />,
      content: (
        <div>
          Review your selections and complete the import process.
        </div>
      ),
    },
  ];

  // UI for each step
  return (
    <div className={`importcsv-overlay${theme === 'dark' ? ' dark' : ''}`} onClick={handleCancel}>
      <div className={`importcsv-modal${theme === 'dark' ? ' dark' : ''}`} onClick={e => e.stopPropagation()}>
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
          <button className="importcsv-close-button" onClick={handleCancel}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="importcsv-scrollable-content">
          <div className="importcsv-content">
            {/* Step 1: File upload */}
            {step === 1 && (
              <>
                <div className="importcsv-quick-actions">
                  <button
                    className="importcsv-action-button importcsv-download-button"
                    onClick={handleDownloadSample}
                  >
                    <Download size={16} />
                    <span>Sample CSV</span>
                  </button>
                  {/* Status indicator always visible */}
                  <div className="importcsv-action-button importcsv-status-button" style={{ minWidth: 120, justifyContent: 'flex-start' }}>
                    {isParsing ? (
                      <Loader2 size={16} className="spin" />
                    ) : parseError ? (
                      <AlertCircle size={16} color="#e11d48" />
                    ) : parsedData ? (
                      <CheckCircle size={16} color="#16a34a" />
                    ) : (
                      <Upload size={16} />
                    )}
                    <span style={{ marginLeft: 6 }}>
                      {isParsing
                        ? 'Parsing...'
                        : parseError
                        ? 'Invalid CSV'
                        : parsedData
                        ? 'CSV Ready'
                        : 'No file selected'}
                    </span>
                  </div>
                </div>
                {/* File upload area and navigation remain unchanged */}
                <div className="importcsv-file-upload-area">
                  <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <button
                    className="importcsv-upload-button"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    disabled={isParsing}
                  >
                    <Upload size={16} />
                    {file ? file.name : 'Select CSV File'}
                  </button>
                  {parseError && <div style={{ color: 'red', marginTop: 8 }}>{parseError}</div>}
                </div>
                <div className="importcsv-collapsible-section importcsv-section-spacing">
                  <button className="importcsv-section-header" onClick={() => setStep(2)} disabled={!parsedData || !!parseError || isParsing} style={{ opacity: parsedData && !parseError && !isParsing ? 1 : 0.5, cursor: parsedData && !parseError && !isParsing ? 'pointer' : 'not-allowed' }}>
                    <div className="importcsv-section-header-content">
                      <FileText size={16} color="#4b5563" />
                      <span className="importcsv-section-title">Next: Portfolio Selection</span>
                    </div>
                    <ChevronRight size={16} color="#4b5563" />
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Portfolio selection/creation */}
            {step === 2 && parsedData && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <strong>Choose a portfolio to import into:</strong>
                </div>
                {Object.keys(portfolios).filter(k => k !== 'default').length > 0 && !addNew ? (
                  <select
                    value={portfolioId}
                    onChange={handlePortfolioSelect}
                    className="importcsv-upload-button"
                  >
                    <option value="" disabled>Select portfolio</option>
                    {Object.keys(portfolios).filter(k => k !== 'default').map(id => (
                      <option key={id} value={id}>{id}</option>
                    ))}
                    <option value="__add_new__">+ Add new portfolio</option>
                  </select>
                ) : (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="New portfolio name"
                      value={newPortfolio}
                      onChange={e => setNewPortfolio(e.target.value)}
                      className="importcsv-upload-button"
                      style={{ flex: 1 }}
                    />
                    {Object.keys(portfolios).filter(k => k !== 'default').length > 0 && (
                      <button type="button" onClick={() => { setAddNew(false); setNewPortfolio(''); }} className="importcsv-cancel-button">Cancel</button>
                    )}
                  </div>
                )}
                {importError && <div style={{ color: 'red', marginTop: 8 }}>{importError}</div>}
                <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                  <button className="importcsv-cancel-button" onClick={handleCancel}>Cancel</button>
                  <button className="importcsv-upload-button" onClick={handleImport} disabled={isImporting}>
                    {isImporting ? 'Importing...' : 'Import'}
                  </button>
                </div>
                {parsedData.warnings && parsedData.warnings.length > 0 && (
                  <div style={{ marginTop: 16, color: '#b45309', background: '#fef3c7', borderRadius: 8, padding: 12 }}>
                    <b>Warnings:</b>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {parsedData.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* Step 3: Success (handled by showMessage and modal close) */}

            {/* Instructions, tips, etc. can be shown in all steps below */}
            {/* Collapsible How to Import Section */}
            <div className="importcsv-collapsible-section">
              <button
                className="importcsv-section-header"
                aria-expanded={showHowToImportSection}
                aria-controls="importcsv-howto-content"
                onClick={() => setShowHowToImportSection((prev) => !prev)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowHowToImportSection((prev) => !prev);
                  }
                }}
                tabIndex={0}
                type="button"
              >
                <div className="importcsv-section-header-content">
                  <ChevronDown
                    className={`importcsv-section-chevron${showHowToImportSection ? ' expanded' : ''}`}
                    size={20}
                    aria-hidden="true"
                  />
                  <span className="importcsv-section-title">How to Import</span>
                </div>
              </button>
              <div
                id="importcsv-howto-content"
                className={`importcsv-section-content${showHowToImportSection ? ' expanded' : ''}`}
                style={{ maxHeight: showHowToImportSection ? '1000px' : '0', overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
                aria-hidden={!showHowToImportSection}
              >
                {showHowToImportSection && (
                  <div className="importcsv-stepper-section">
                    <div className="importcsv-stepper-list">
                      {stepperSteps.map((step, idx) => (
                        <div className="importcsv-stepper-item" key={step.label}>
                          <div className="importcsv-stepper-label-row">
                            <span className="importcsv-stepper-icon">{step.icon}</span>
                            <span className="importcsv-stepper-label">{idx + 1}. {step.label}</span>
                          </div>
                          <div className="importcsv-stepper-content">{step.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* ...other collapsible sections for required/optional columns, tips, warning, etc. can be added here as before... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportCSVInstructions;