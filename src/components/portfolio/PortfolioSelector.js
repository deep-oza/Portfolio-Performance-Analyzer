import React, { useContext, useState, useRef, useEffect } from 'react';
import { PortfolioContext } from '../../contexts/PortfolioContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faCog } from '@fortawesome/free-solid-svg-icons';
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
    showModal,
    theme // <-- add theme from context
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

  // No outside-click handler needed for modal; overlay handles focus trapping visually

  // Get portfolio data to check if it's empty
  const portfolioData = selectedPortfolioId === 'default'
    ? Object.entries(portfolios)
        .filter(([id]) => id !== 'default')
        .flatMap(([, stocks]) => stocks)
    : portfolios[selectedPortfolioId] || [];

  const handleCreateClick = () => {
    setModalInput('');
    setCreating(true);
  };

  const handleCreateConfirm = () => {
    const name = modalInput.trim();
    if (name && !portfolios[name]) {
      createPortfolio(name);
      setCreating(false);
    }
  };

  const handleCreateCancel = () => {
    setCreating(false);
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
    <div className={`portfolio-selector-card${theme === 'dark' ? ' dark' : ''}`} role="region" aria-label="Portfolio selection">
      {/* Local Create Portfolio Modal */}
      {creating && (
        <div className="modal-overlay active portfolio-selector-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="create-portfolio-title">
          <div className="modal-container portfolio-selector-modal-container pro-modal">
            <div className="modal-header portfolio-selector-modal-header pro-modal-header">
              <span className="pro-modal-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#2563eb"/><path d="M12 7v6m0 4h.01" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
              <div>
                <h3 className="modal-title portfolio-selector-modal-title pro-modal-title" id="create-portfolio-title">Create New Portfolio</h3>
                <div className="pro-modal-subtitle">Organize your investments by creating a new portfolio.</div>
              </div>
            </div>
            <div className="modal-body portfolio-selector-modal-body pro-modal-body">
              <div className="portfolio-selector-modal-body-inner pro-modal-body-inner">
                <label htmlFor="new-portfolio-name" className="portfolio-selector-modal-label pro-modal-label">Portfolio Name</label>
                <input
                  id="new-portfolio-name"
                  type="text"
                  autoFocus
                  value={modalInput}
                  onChange={e => setModalInput(e.target.value)}
                  placeholder="Enter portfolio name"
                  className={`portfolio-selector-modal-input pro-modal-input${modalInput.trim() && portfolios[modalInput.trim()] ? ' pro-modal-input-error' : ''}`}
                  aria-invalid={modalInput.trim() && portfolios[modalInput.trim()] ? 'true' : 'false'}
                  aria-describedby={modalInput.trim() && !portfolios[modalInput.trim()] ? 'portfolio-name-desc' : undefined}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreateConfirm(); if (e.key === 'Escape') handleCreateCancel(); }}
                />
                {modalInput.trim() && !portfolios[modalInput.trim()] && (
                  <div id="portfolio-name-desc" className="pro-modal-input-desc pro-modal-input-hint">Choose a unique name for your new portfolio.</div>
                )}
                {modalInput.trim() && portfolios[modalInput.trim()] && (
                  <div className="pro-modal-error" role="alert">A portfolio with this name already exists.</div>
                )}
              </div>
            </div>
            <div className="modal-footer portfolio-selector-modal-footer pro-modal-footer">
              <button className="btn btn-secondary pro-modal-btn" onClick={handleCreateCancel} tabIndex={0}>Cancel</button>
              <button className="btn btn-primary pro-modal-btn" onClick={handleCreateConfirm} disabled={!modalInput.trim() || portfolios[modalInput.trim()]} tabIndex={0}>Create</button>
            </div>
          </div>
        </div>
      )}
      <div className="portfolio-selector-header">
        <h2 className="portfolio-selector-title">Portfolios</h2>
        <span className="portfolio-selector-subtitle">Manage and switch between your investment portfolios</span>
      </div>
      <div className="portfolio-selector-row">
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
  >
    <FontAwesomeIcon icon={faPlus} />
  </button>

  <div className="portfolio-selector-column-dropdown-wrapper">
    <button
      className="btn btn-sm btn-secondary portfolio-selector-column-dropdown-btn"
      onClick={() => setShowColumnDropdown((prev) => !prev)}
      aria-label="Column settings"
    >
<FontAwesomeIcon icon={faCog} className="column-icon" />
<span className="column-text">Columns</span>    </button>
    {showColumnDropdown && (
      <ColumnsModal
        DEFAULT_COLUMNS={DEFAULT_COLUMNS}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        handleToggleColumn={handleToggleColumn}
        dragColIndex={dragColIndex}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        handleDragEnd={handleDragEnd}
        onClose={() => setShowColumnDropdown(false)}
      />
    )}
  </div>

  {/* 📊 Show Analytics Button - moved to the end */}
  {portfolioData.length > 0 && (
    <button
      className="show-analytics-btn"
      onClick={() => setShowAnalytics((prev) => !prev)}
    >
      {showAnalytics ? '📊 Hide Analytics' : '📊 Show Analytics'}
    </button>
  )}
</div>

    </div>
  );
};

export default PortfolioSelector; 

// Professional Columns Modal
const ColumnsModal = ({
  DEFAULT_COLUMNS,
  visibleColumns,
  setVisibleColumns,
  handleToggleColumn,
  dragColIndex,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  onClose
}) => {
  const [columnSearch, setColumnSearch] = React.useState('');
  const trimmedSearch = columnSearch.trim();
  const isSearching = trimmedSearch.length > 0;
  const lower = trimmedSearch.toLowerCase();
  const visibleSet = new Set(visibleColumns);
  const allVisibleCols = visibleColumns
    .map(key => DEFAULT_COLUMNS.find(c => c.key === key))
    .filter(Boolean);
  const allHiddenCols = DEFAULT_COLUMNS.filter(c => !visibleSet.has(c.key));
  const filterFn = (col) => col.label.toLowerCase().includes(lower) || col.key.toLowerCase().includes(lower);
  const visibleList = isSearching ? allVisibleCols.filter(filterFn) : allVisibleCols;
  const hiddenList = isSearching ? allHiddenCols.filter(filterFn) : allHiddenCols;
  const selectedCount = visibleColumns.length;
  const totalCount = DEFAULT_COLUMNS.length;

  const handleSelectAll = () => {
    setVisibleColumns(DEFAULT_COLUMNS.map(c => c.key));
  };
  const handleDeselectAll = () => {
    setVisibleColumns(DEFAULT_COLUMNS.filter(c => c.key === 'symbol').map(c => c.key));
  };
  const handleReset = () => {
    setVisibleColumns(DEFAULT_COLUMNS.map(c => c.key));
    setColumnSearch('');
  };

  return (
    <div className="columns-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="columns-modal-title">
      <div className="columns-modal">
        <div className="columns-modal-header">
          <h3 id="columns-modal-title">Customize Columns</h3>
          <button className="columns-modal-close" aria-label="Close" onClick={onClose}>✕</button>
        </div>

        <div className="column-dropdown-toolbar">
        <div className="column-search-wrap">
          <input
            type="text"
            className="column-dropdown-search"
            placeholder="Search columns..."
            value={columnSearch}
            onChange={(e) => setColumnSearch(e.target.value)}
            aria-label="Search columns"
          />
          {isSearching && (
            <button
              type="button"
              className="column-search-clear"
              aria-label="Clear search"
              onClick={() => setColumnSearch('')}
            >
              ✕
            </button>
          )}
        </div>
        <div className="column-dropdown-meta">
          <span className="column-badge" aria-live="polite">{selectedCount} / {totalCount} selected</span>
          {isSearching && <span className="column-hint">Drag disabled while searching</span>}
        </div>
        </div>

        <div className="column-dropdown-list">
        {/* Visible section (draggable) */}
        {visibleList.length > 0 && (
          <div className="column-section">
            <div className="column-dropdown-section-title">Visible</div>
            {visibleList.map((col) => {
              const vIdx = visibleColumns.indexOf(col.key);
              return (
                <label
                  key={`vis-${col.key}`}
                  className={`column-dropdown-checkbox portfolio-selector-column-dropdown-checkbox${col.key === 'symbol' ? ' symbol' : ''}${dragColIndex.current === vIdx ? ' dragging' : ''}`}
                  draggable={!isSearching && col.key !== 'symbol'}
                  onDragStart={!isSearching && col.key !== 'symbol' ? () => handleDragStart(vIdx) : undefined}
                  onDragOver={!isSearching && col.key !== 'symbol' ? (e) => handleDragOver(e, vIdx) : undefined}
                  onDrop={!isSearching && col.key !== 'symbol' ? () => handleDrop(vIdx) : undefined}
                  onDragEnd={!isSearching && col.key !== 'symbol' ? handleDragEnd : undefined}
                >
                  {col.key !== 'symbol' && <span className="portfolio-selector-column-drag-handle" aria-hidden>☰</span>}
                  <input
                    type="checkbox"
                    checked
                    onChange={() => handleToggleColumn(col.key)}
                    disabled={col.key === 'symbol'}
                  />
                  {col.label}
                </label>
              );
            })}
          </div>
        )}

        {/* Divider */}
        {visibleList.length > 0 && hiddenList.length > 0 && (
          <div className="column-dropdown-divider" />
        )}

        {/* Hidden section (not draggable) */}
        {hiddenList.length > 0 && (
          <div className="column-section">
            <div className="column-dropdown-section-title">Hidden</div>
            {hiddenList.map((col) => (
              <label
                key={`hid-${col.key}`}
                className={`column-dropdown-checkbox portfolio-selector-column-dropdown-checkbox${col.key === 'symbol' ? ' symbol' : ''}`}
              >
                {col.key !== 'symbol' && <span className="portfolio-selector-column-drag-handle" aria-hidden>☰</span>}
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => handleToggleColumn(col.key)}
                  disabled={col.key === 'symbol'}
                />
                {col.label}
              </label>
            ))}
          </div>
        )}
        </div>

        <div className="column-dropdown-actions portfolio-selector-column-dropdown-actions">
          <button className="btn btn-sm btn-secondary btn-ghost" onClick={handleSelectAll}>Select all</button>
          <button className="btn btn-sm btn-secondary btn-ghost" onClick={handleDeselectAll}>Deselect all</button>
          <button className="btn btn-sm btn-secondary" onClick={handleReset}>Reset</button>
          <button className="btn btn-sm btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};