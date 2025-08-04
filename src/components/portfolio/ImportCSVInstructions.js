// ImportCSVInstructions.jsx
import React, { useState, useRef } from 'react';
import './ImportCSVInstructions.css';
import { importPortfolioCSV } from '../../utils/csvUtils';
// eslint-disable-next-line
import { FileText, Download, Upload, AlertCircle, CheckCircle, X, ChevronDown, ChevronRight, Loader2, FileDown, Columns, Upload as UploadIcon, FolderPlus, CheckCircle as CheckCircleIcon, FileSpreadsheet, Database, ArrowRight, Info } from 'lucide-react';

const requiredColumns = [
  { name: 'symbol', alternatives: 'stock, ticker, scrip', icon: <Database size={14} /> },
  { name: 'qty', alternatives: 'quantity, shares, units, holding', icon: <FileText size={14} /> },
  { name: 'avg price', alternatives: 'average price, buy price, purchase price, cost', icon: <FileText size={14} /> }
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

  // Download sample files
  const handleDownloadSample = (fileType) => {
    const link = document.createElement('a');
    const fileName = fileType === 'excel' ? 'sample_portfolio.xlsx' : 'sample_portfolio.csv';
    link.href = process.env.PUBLIC_URL + '/' + fileName;
    link.download = fileName;
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
          Download the sample CSV and use it as a template for your data. You can also create an Excel file with the same columns.
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
                  {col.icon}
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
      label: 'Upload Your File',
      icon: <UploadIcon size={18} />,
      content: (
        <div>
          Upload your CSV or Excel file and preview your data before importing.
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
              <Upload size={24} color="white" />
            </div>
            <div className="importcsv-header-text">
              <h2 className="importcsv-header-title">Import Portfolio</h2>
              <p className="importcsv-header-subtitle">Upload your portfolio data from CSV or Excel</p>
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
                {/* Quick Actions Bar */}
                <div className="importcsv-quick-actions">
                  <div className="importcsv-action-group">
                    <button
                      className="importcsv-action-button importcsv-download-button"
                      onClick={() => handleDownloadSample('csv')}
                    >
                      <FileText size={16} />
                      <span>Sample CSV</span>
                    </button>
                    <button
                      className="importcsv-action-button importcsv-download-button"
                      onClick={() => handleDownloadSample('excel')}
                    >
                      <FileSpreadsheet size={16} />
                      <span>Sample Excel</span>
                    </button>
                  </div>
                  
                  {/* Status indicator */}
                  <div className="importcsv-status-indicator">
                    {isParsing ? (
                      <div className="importcsv-status-item parsing">
                        <Loader2 size={16} className="spin" />
                        <span>Processing file...</span>
                      </div>
                    ) : parseError ? (
                      <div className="importcsv-status-item error">
                        <AlertCircle size={16} />
                        <span>Invalid file format</span>
                      </div>
                    ) : parsedData ? (
                      <div className="importcsv-status-item success">
                        <CheckCircle size={16} />
                        <span>File ready to import</span>
                      </div>
                    ) : (
                      <div className="importcsv-status-item idle">
                        <Upload size={16} />
                        <span>No file selected</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* File Upload Area */}
                <div className="importcsv-file-upload-section">
                  <div className="importcsv-upload-area">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <button
                      className="importcsv-upload-button"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      disabled={isParsing}
                    >
                      <div className="importcsv-upload-icon">
                        <Upload size={24} />
                      </div>
                      <div className="importcsv-upload-text">
                        <span className="importcsv-upload-title">
                          {file ? file.name : 'Choose CSV or Excel file'}
                        </span>
                        <span className="importcsv-upload-subtitle">
                          {file ? 'Click to change file' : 'or drag and drop here'}
                        </span>
                      </div>
                    </button>
                  </div>
                  
                  {parseError && (
                    <div className="importcsv-error-message">
                      <AlertCircle size={16} />
                      <span>{parseError}</span>
                    </div>
                  )}
                </div>

                {/* Next Step Button */}
                <div className="importcsv-navigation">
                  <button 
                    className="importcsv-next-button" 
                    onClick={() => setStep(2)} 
                    disabled={!parsedData || !!parseError || isParsing}
                  >
                    <span>Continue to Portfolio Selection</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Portfolio selection/creation */}
            {step === 2 && parsedData && (
              <>
                <div className="importcsv-portfolio-section">
                  <div className="importcsv-section-header">
                    <h3 className="importcsv-section-title">Select Portfolio</h3>
                    <p className="importcsv-section-description">
                      Choose an existing portfolio or create a new one for your imported data
                    </p>
                  </div>

                  <div className="importcsv-portfolio-options">
                    {Object.keys(portfolios).filter(k => k !== 'default').length > 0 && !addNew ? (
                      <div className="importcsv-select-wrapper">
                        <label className="importcsv-select-label">Existing Portfolio</label>
                        <select
                          value={portfolioId}
                          onChange={handlePortfolioSelect}
                          className="importcsv-select"
                        >
                          <option value="" disabled>Select a portfolio</option>
                          {Object.keys(portfolios).filter(k => k !== 'default').map(id => (
                            <option key={id} value={id}>{id}</option>
                          ))}
                          <option value="__add_new__">+ Create new portfolio</option>
                        </select>
                      </div>
                    ) : (
                      <div className="importcsv-new-portfolio">
                        <label className="importcsv-input-label">New Portfolio Name</label>
                        <div className="importcsv-input-group">
                          <input
                            type="text"
                            placeholder="Enter portfolio name"
                            value={newPortfolio}
                            onChange={e => setNewPortfolio(e.target.value)}
                            className="importcsv-input"
                            autoFocus
                          />
                          {Object.keys(portfolios).filter(k => k !== 'default').length > 0 && (
                            <button 
                              type="button" 
                              onClick={() => { setAddNew(false); setNewPortfolio(''); }} 
                              className="importcsv-cancel-new-button"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {importError && (
                    <div className="importcsv-error-message">
                      <AlertCircle size={16} />
                      <span>{importError}</span>
                    </div>
                  )}

                  {/* Warnings */}
                  {parsedData.warnings && parsedData.warnings.length > 0 && (
                    <div className="importcsv-warnings">
                      <div className="importcsv-warning-header">
                        <Info size={16} />
                        <span>Import Warnings</span>
                      </div>
                      <ul className="importcsv-warning-list">
                        {parsedData.warnings.map((warning, i) => (
                          <li key={i} className="importcsv-warning-item">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="importcsv-action-buttons">
                    <button className="importcsv-back-button" onClick={() => setStep(1)}>
                      Back
                    </button>
                    <button 
                      className="importcsv-import-button" 
                      onClick={handleImport} 
                      disabled={isImporting}
                    >
                      {isImporting ? (
                        <>
                          <Loader2 size={16} className="spin" />
                          <span>Importing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          <span>Import Portfolio</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Instructions Section */}
            <div className="importcsv-instructions-section">
              <button
                className="importcsv-instructions-toggle"
                onClick={() => setShowHowToImportSection(!showHowToImportSection)}
              >
                <div className="importcsv-instructions-header">
                  <Info size={18} />
                  <span>How to Import Portfolio</span>
                </div>
                <ChevronDown
                  className={`importcsv-chevron${showHowToImportSection ? ' expanded' : ''}`}
                  size={20}
                />
              </button>
              
              <div className={`importcsv-instructions-content${showHowToImportSection ? ' expanded' : ''}`}>
                <div className="importcsv-steps">
                  {stepperSteps.map((stepItem, index) => (
                    <div key={index} className="importcsv-step">
                      <div className="importcsv-step-header">
                        <div className="importcsv-step-icon">
                          {stepItem.icon}
                        </div>
                        <span className="importcsv-step-title">{stepItem.label}</span>
                      </div>
                      <div className="importcsv-step-content">
                        {stepItem.content}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="importcsv-tips">
                  <h4 className="importcsv-tips-title">Quick Tips</h4>
                  <ul className="importcsv-tips-list">
                    <li>Supported formats: CSV, Excel (.xlsx, .xls)</li>
                    <li>Column names are not case-sensitive</li>
                    <li>Extra columns will be ignored</li>
                    <li>Ensure your data is properly formatted</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportCSVInstructions;