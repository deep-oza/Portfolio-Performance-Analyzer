import React, { useContext, useState, useRef, useEffect } from 'react';
import { PortfolioContext } from '../../contexts/PortfolioContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faCog, faChartLine } from '@fortawesome/free-solid-svg-icons';
import './PortfolioSelector.css';

const PortfolioSelector = ({
  showAnalytics,
  setShowAnalytics,
  showColumnDropdown,
  setShowColumnDropdown,
  handleToggleColumn,
  visibleColumns,
  setVisibleColumns,
  DEFAULT_COLUMNS
}) => {
  const {
    portfolios,
    selectedPortfolioId,
    switchPortfolio,
    createPortfolio,
    deletePortfolio,
    showModal
  } = useContext(PortfolioContext);
  const [creating, setCreating] = useState(false);
  const [modalInput, setModalInput] = useState('');

  // For drag-and-drop
  const dragColIndex = useRef(null);
  const handleDragStart = (index) => { dragColIndex.current = index; };
  const handleDragOver = (e, index) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (index) => {
    const from = dragColIndex.current;
    if (from === null || from === index) return;
    setVisibleColumns(cols => {
      const newCols = [...cols];
      const [moved] = newCols.splice(from, 1);
      newCols.splice(index, 0, moved);
      return newCols;
    });
    dragColIndex.current = null;
  };
  const handleDragEnd = () => { dragColIndex.current = null; };

  // Close dropdown on outside click
  const dropdownRef = useRef();
  useEffect(() => {
    if (!showColumnDropdown) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowColumnDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showColumnDropdown, setShowColumnDropdown]);

  const handleCreateClick = () => {
    setModalInput('');
    setCreating(true);
    showModal({
      title: 'Create New Portfolio',
      message: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="new-portfolio-name" style={{ marginBottom: 4, fontWeight: 500 }}>Portfolio Name</label>
          <input
            id="new-portfolio-name"
            type="text"
            autoFocus
            value={modalInput}
            onChange={e => setModalInput(e.target.value)}
            placeholder="Enter portfolio name"
            style={{ padding: '8px 12px', borderRadius: 6, border: '1.5px solid #d0d7de', fontSize: '1rem', outline: 'none' }}
          />
        </div>
      ),
      confirmText: 'Create',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: () => {
        const name = modalInput.trim();
        if (name && !portfolios[name]) {
          createPortfolio(name);
        }
        setCreating(false);
      },
      onCancel: () => setCreating(false),
    });
  };

  const handleDelete = (id) => {
    showModal({
      title: 'Delete Portfolio',
      message: `Are you sure you want to delete the portfolio '${id}'? This cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: () => deletePortfolio(id),
      onCancel: () => {},
    });
  };

  return (
    <div className="portfolio-selector-card" role="region" aria-label="Portfolio selection">
      <div className="portfolio-selector-header">
        <h2 className="portfolio-selector-title">Portfolios</h2>
        <span className="portfolio-selector-subtitle">Manage and switch between your investment portfolios</span>
      </div>
      <div className="portfolio-selector-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <label htmlFor="portfolio-select" className="portfolio-selector-label">Active Portfolio</label>
        <select
          id="portfolio-select"
          value={selectedPortfolioId}
          onChange={e => switchPortfolio(e.target.value)}
          className="portfolio-selector-select"
          aria-label="Select portfolio"
        >
          {Object.keys(portfolios).map(id => (
            <option key={id} value={id}>{id === 'default' ? 'All Portfolios' : id}</option>
          ))}
        </select>
        {selectedPortfolioId !== 'default' && (
          <button
            className="portfolio-selector-delete"
            title="Delete this portfolio"
            aria-label="Delete selected portfolio"
            onClick={() => handleDelete(selectedPortfolioId)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        )}
        <button
          className="portfolio-selector-add"
          title="Create new portfolio"
          aria-label="Create new portfolio"
          onClick={handleCreateClick}
          style={{ marginLeft: 8 }}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
        {/* Show Analytics and Columns buttons */}
        <button
          className="show-analytics-btn"
          style={{ marginLeft: 16 }}
          onClick={() => setShowAnalytics((prev) => !prev)}
        >
          {showAnalytics ? '📊 Hide Analytics' : '📊 Show Analytics'}
        </button>
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-sm btn-secondary"
            style={{ marginLeft: 8 }}
            onClick={() => setShowColumnDropdown((prev) => !prev)}
            aria-label="Column settings"
          >
            <FontAwesomeIcon icon={faCog} /> Columns
          </button>
          {showColumnDropdown && (
            <div className="column-dropdown" ref={dropdownRef} style={{ position: 'absolute', right: 0, zIndex: 100 }}>
              <div className="column-dropdown-header">Customize Columns</div>
              <div className="column-dropdown-list">
                {DEFAULT_COLUMNS.map((col, idx) => (
                  <label
                    key={col.key}
                    className="column-dropdown-checkbox"
                    style={{ fontWeight: col.key === 'symbol' ? 600 : 400, opacity: col.key === 'symbol' ? 0.7 : 1, cursor: col.key === 'symbol' ? 'not-allowed' : 'grab', background: dragColIndex.current === idx ? 'var(--primary-100)' : undefined }}
                    draggable={col.key !== 'symbol'}
                    onDragStart={col.key !== 'symbol' ? () => handleDragStart(idx) : undefined}
                    onDragOver={col.key !== 'symbol' ? (e) => handleDragOver(e, idx) : undefined}
                    onDrop={col.key !== 'symbol' ? () => handleDrop(idx) : undefined}
                    onDragEnd={col.key !== 'symbol' ? handleDragEnd : undefined}
                  >
                    {col.key !== 'symbol' && <span style={{ marginRight: 8, cursor: 'grab', opacity: 0.7 }}>☰</span>}
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(col.key)}
                      onChange={() => handleToggleColumn(col.key)}
                      disabled={col.key === 'symbol'}
                    />
                    {col.label}
                  </label>
                ))}
              </div>
              <div className="column-dropdown-actions" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  className="btn btn-sm btn-secondary"
                  style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', padding: '8px 10px', fontSize: 14 }}
                  onClick={() => setVisibleColumns(DEFAULT_COLUMNS.map(col => col.key))}
                >
                  Reset
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', padding: '8px 10px', fontSize: 14 }}
                  onClick={() => setShowColumnDropdown(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="portfolio-selector-divider" role="separator" aria-orientation="horizontal" />
    </div>
  );
};

export default PortfolioSelector; 