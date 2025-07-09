/**
 * Utilities for CSV import and export
 */

/**
 * Import portfolio data from CSV file
 * @param {File} file - The CSV file to import
 * @returns {Promise} - Resolves to an object with portfolio and prices
 */
export const importPortfolioCSV = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file selected."));
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        // Split file contents into lines
        const text = e.target.result.trim();
        const lines = text.split(/\r?\n/);
        
        if (lines.length < 2) {
          reject(new Error("CSV needs header + at least one data row."));
          return;
        }

        // Find the first line that contains all required columns
        const requiredCols = ["symbol", "qty", "avg price"];
        let headerLineIdx = -1;
        let headerCols = [];
        for (let i = 0; i < lines.length; i++) {
          const cols = lines[i].split(/[\t,]/).map((h) => h.trim().toLowerCase());
          let foundAll = requiredCols.every(req => cols.includes(req));
          if (foundAll) {
            headerLineIdx = i;
            headerCols = cols;
            break;
          }
        }
        if (headerLineIdx === -1) {
          reject(new Error(
            `CSV is missing required columns: ${requiredCols.join(", ")}.\n\n` +
            `Required columns: symbol, qty, avg price.\n` +
            `Optional columns: name, purchase date, current price, realized gain, dividend.`
          ));
          return;
        }

        // Expected columns and their possible alternative names
        const columnMappings = {
          symbol: ["symbol", "stock", "ticker", "scrip"],
          name: ["name", "stock name", "company name", "company"],
          qty: ["qty", "quantity", "shares", "units", "holding"],
          "avg price": [
            "avg price",
            "average price",
            "buy price",
            "purchase price",
            "cost",
          ],
          "purchase date": [
            "purchase date",
            "buy date",
            "date",
            "acquired date",
            "acquisition date",
          ],
          "current price": [
            "current price",
            "price",
            "market price",
            "ltp",
            "cmp",
          ],
          "realized gain": [
            "realized gain",
            "realized profit",
            "booked profit",
            "profit booked",
          ],
          dividend: ["dividend", "dividends", "div"],
        };

        // Create a map of actual column indices to our internal column names
        const colMap = {};
        let missingRequired = [];

        // Map header columns to our expected columns
        Object.keys(columnMappings).forEach((internalName) => {
          const possibleNames = columnMappings[internalName];
          const foundIndex = headerCols.findIndex((h) =>
            possibleNames.includes(h)
          );

          if (foundIndex !== -1) {
            colMap[internalName] = foundIndex;
          } else if (requiredCols.includes(internalName)) {
            missingRequired.push(internalName);
          }
        });

        // Check if all required columns are present
        if (missingRequired.length > 0) {
          reject(
            new Error(
              `CSV is missing required columns: ${missingRequired.join(", ")}.\n\n` +
                `Required columns: symbol, qty, avg price.\n` +
                `Optional columns: name, purchase date, current price, realized gain, dividend.`
            )
          );
          return;
        }

        // Build new portfolio data
        const newPortfolio = [];
        const newPrices = {};
        const skippedRows = [];

        // Start reading data from the line after the header
        for (let i = headerLineIdx + 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue; // Skip empty lines

          // Split the line into columns
          const cols = line.split(/[\t,]/).map((c) => c.trim());

          // Extract values using the column mapping
          const sym = colMap.symbol !== undefined ? cols[colMap.symbol] : "";

          // Skip rows without a symbol
          if (!sym) {
            skippedRows.push(`Row ${i + 1}: Missing symbol`);
            continue;
          }

          // Get quantity and validate
          let qty = colMap.qty !== undefined ? cols[colMap.qty] : "";
          qty = parseFloat(qty) || 0;

          if (qty <= 0) {
            skippedRows.push(
              `Row ${i + 1}, ${sym}: Invalid quantity (${qty})`
            );
            // Still continue with the row, but using 0 as qty
          }

          // Get average price and validate
          let avgP =
            colMap["avg price"] !== undefined
              ? cols[colMap["avg price"]]
              : "";
          avgP = parseFloat(avgP) || 0;

          if (avgP <= 0) {
            skippedRows.push(
              `Row ${i + 1}, ${sym}: Invalid avg price (${avgP})`
            );
            // Still continue with the row, but using 0 as avgP
          }

          // Get other optional values
          const name =
            colMap.name !== undefined ? cols[colMap.name] || sym : sym;

          // Handle purchase date with graceful fallback
          let isoDate = "-";
          if (
            colMap["purchase date"] !== undefined &&
            cols[colMap["purchase date"]]
          ) {
            const dateStr = cols[colMap["purchase date"]];

            // Try different date formats (DD-MM-YYYY, YYYY-MM-DD, MM/DD/YYYY)
            if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(dateStr)) {
              // DD-MM-YYYY or MM/DD/YYYY format
              const parts = dateStr.split(/[-/]/);
              // Assume DD-MM-YYYY format (most common in India)
              isoDate = `${parts[2].padStart(4, "0")}-${parts[1].padStart(
                2,
                "0"
              )}-${parts[0].padStart(2, "0")}`;
            } else if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(dateStr)) {
              // YYYY-MM-DD format (already ISO)
              isoDate = dateStr;
            } else {
              // Try parsing as a JavaScript date as last resort
              try {
                const date = new Date(dateStr);
                if (!isNaN(date)) {
                  isoDate = date.toISOString().split("T")[0];
                }
              } catch (e) {
                // Invalid date, keep as "-"
              }
            }
          }

          // Get realized gain and dividend, defaulting to 0
          const rGain =
            colMap["realized gain"] !== undefined
              ? parseFloat(cols[colMap["realized gain"]]) || 0
              : 0;
          const divd =
            colMap.dividend !== undefined
              ? parseFloat(cols[colMap.dividend]) || 0
              : 0;

          // Create the stock object
          const stock = {
            symbol: sym.toUpperCase(),
            name: name,
            qty: qty,
            avgPrice: avgP,
            invested: qty * avgP,
            purchaseDate: isoDate,
            realizedGain: rGain,
            dividend: divd,
          };

          newPortfolio.push(stock);

          // Store current price (if available) or null
          const curP =
            colMap["current price"] !== undefined
              ? cols[colMap["current price"]]
              : "";
          newPrices[sym.toUpperCase()] = curP ? parseFloat(curP) : null;
        }

        // Check if we have any valid entries
        if (newPortfolio.length === 0) {
          reject(new Error("No valid stock entries found in the CSV file."));
          return;
        }

        // Return the new portfolio data and prices
        resolve({
          portfolio: newPortfolio, 
          prices: newPrices,
          warnings: skippedRows
        });
      } catch (error) {
        reject(new Error(`Error parsing CSV: ${error.message}`));
      }
    };

    reader.onerror = function () {
      reject(new Error("Error reading the file."));
    };

    reader.readAsText(file);
  });
};

/**
 * Export portfolio data to CSV
 * @param {Array} portfolioData - The portfolio data
 * @param {Object} currentPrices - The current prices
 * @param {Function} calculateDaysHeld - Function to calculate days held
 * @returns {string} - CSV content as a string
 */
export const exportPortfolioCSV = (portfolioData, currentPrices, calculateDaysHeld) => {
  // Compute summary values
  let totalInvested = 0,
    currentValue = 0;
  let sumWeightedCagr = 0,
    sumInvestedWithPrice = 0;

  portfolioData.forEach((stock) => {
    const symbol = stock.symbol;
    const invested = stock.invested || 0;
    totalInvested += invested;
    const price = parseFloat(currentPrices[symbol]) || 0;
    if (price > 0) {
      const cv = stock.qty * price;
      currentValue += cv;
      const days = calculateDaysHeld(stock.purchaseDate);
      const yrs = days / 365.25;
      if (yrs > 0 && invested > 0 && cv > 0 && days >= 90) { // Only include if held at least 90 days
        try {
          // Use a safe calculation approach
          const cagr = (Math.pow(cv / invested, 1 / yrs) - 1) * 100;
          // Only include valid CAGR values
          if (
            isFinite(cagr) &&
            !isNaN(cagr) &&
            cagr > -100 &&
            cagr < 200 // Only include if CAGR < 200%
          ) {
            sumWeightedCagr += invested * cagr;
            sumInvestedWithPrice += invested;
          }
        } catch (e) {
          console.error("Export CAGR calculation error:", e);
          // Skip this stock for CAGR calculation if there's an error
        }
      }
    }
  });

  const totalGain = currentValue - totalInvested;

  // Apply bounds checking to overall return
  let overallReturn = 0;
  if (totalInvested > 0) {
    overallReturn = (totalGain / totalInvested) * 100;
    overallReturn = Math.max(Math.min(overallReturn, 999999), -99.99);
  }

  // Apply bounds checking to average CAGR
  let averageCagr = 0;
  if (sumInvestedWithPrice > 0) {
    averageCagr = sumWeightedCagr / sumInvestedWithPrice;
    averageCagr = Math.max(Math.min(averageCagr, 999999), -99.99);
  }

  // Build CSV rows
  const rows = [];
  rows.push(["Portfolio Performance Analyzer"]);
  rows.push(["Total Invested", totalInvested.toFixed(2)]);
  rows.push(["Current Value", currentValue.toFixed(2)]);
  rows.push(["Total Gain/Loss", totalGain.toFixed(2)]);
  rows.push(["Average CAGR", averageCagr.toFixed(2) + "%"]);
  rows.push(["Overall Return", overallReturn.toFixed(2) + "%"]);
  rows.push([]); // blank line

  // Table headers (import-compatible + extra reference columns, all lowercase and with alternatives)
  const headers = [
    "symbol",
    "name",
    "qty", // also matches 'quantity', 'shares', etc. in import
    "avg price", // also matches 'average price', 'buy price', etc.
    "purchase date",
    "current price",
    "realized gain",
    "dividend",
    "total return" ,
    "cagr %",
    "days held"
  ];
  rows.push(headers);

  // Table data (import-compatible + extra reference columns)
  portfolioData.forEach((stock) => {
    const symbol = stock.symbol;
    const qty = stock.qty;
    const avgPrice = stock.avgPrice;
    const purchaseDate = stock.purchaseDate;
    const rg = stock.realizedGain || 0;
    const dv = stock.dividend || 0;
    const price = parseFloat(currentPrices[symbol]) || 0;
    let days = "", years = null, cagr = "", returnPercent = "", totalReturn = "";
    if (purchaseDate && price > 0 && avgPrice > 0 && qty > 0) {
      days = calculateDaysHeld(purchaseDate);
      years = days / 365.25;
      if (years > 0 && days >= 90) {
        try {
          const invested = qty * avgPrice;
          const currentValue = qty * price;
          const rawCagr = (Math.pow(currentValue / invested, 1 / years) - 1) * 100;
          if (isFinite(rawCagr) && !isNaN(rawCagr) && rawCagr > -100 && rawCagr < 200) {
            cagr = rawCagr.toFixed(2) + "%";
          }
        } catch {}
      }
      // Return % Since Purchase
      if (avgPrice > 0) {
        returnPercent = (((price - avgPrice) / avgPrice) * 100).toFixed(2);
        totalReturn = ((qty * price - qty * avgPrice).toFixed(2)) + ' (' + (returnPercent >= 0 ? '+' : '') + returnPercent + '%)';
      }
    }
    rows.push([
      stock.symbol,
      stock.name || "",
      qty,
      avgPrice.toFixed(2),
      purchaseDate,
      price ? price.toFixed(2) : "",
      rg.toFixed(2),
      dv.toFixed(2),
      totalReturn,
      cagr,
      days
    ]);
  });

  // Convert to CSV text
  return rows.map((r) => r.join(",")).join("\n");
};

// Helper to download CSV data
export const downloadCSV = (csvContent, filename = "portfolio_full_export.csv") => {
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}; 