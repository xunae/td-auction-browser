import { RESTO_SUMMARY_ITEMS } from './constants.js';
import { state } from './state.js';
import { els } from './dom.js';
import { formatPrice } from './format.js';
import { refreshWowheadLinks } from './tooltip.js';

export function setRestoSummaryStatus(message, isError = false) {
  els.restoSummaryStatus.textContent = message;
  els.restoSummaryStatus.classList.toggle('error', isError);
}

function buildItemsByIdMap() {
  return new Map(state.items.map((item) => [item.id, item]));
}

export function computeRestoSummary() {
  const categories = [];
  const byCategory = new Map();
  let foundCount = 0;
  let missingCount = 0;
  let grandTotal = 0;
  const itemsById = buildItemsByIdMap();

  for (const configItem of RESTO_SUMMARY_ITEMS) {
    const currentItem = itemsById.get(configItem.id);
    const row = {
      ...configItem,
      found: Boolean(currentItem),
      displayName: currentItem ? currentItem.name : configItem.name,
      price: currentItem ? currentItem.price : null,
      amount: currentItem ? currentItem.amount : null,
    };

    if (row.found) {
      foundCount += 1;
    } else {
      missingCount += 1;
    }

    let category = byCategory.get(configItem.category);
    if (!category) {
      category = {
        name: configItem.category,
        rows: [],
        subtotal: 0,
      };
      byCategory.set(configItem.category, category);
      categories.push(category);
    }

    if (row.price !== null) {
      category.subtotal += row.price;
      grandTotal += row.price;
    }

    category.rows.push(row);
  }

  return {
    categories,
    foundCount,
    missingCount,
    grandTotal,
  };
}

export function renderRestoSummary() {
  if (!state.hasAuctionData) {
    els.restoSummaryCategories.innerHTML = '';
    els.restoSummaryTotalPrice.textContent = '-';
    setRestoSummaryStatus(
      'Load auction data to view current prices for the curated resto list.',
      true,
    );
    return;
  }

  const summary = computeRestoSummary();
  els.restoSummaryCategories.innerHTML = summary.categories
    .map((category) => {
      const rowsHtml = category.rows
        .map((row) => {
          if (!row.found) {
            return `
              <div class="resto-summary-row">
                <div class="resto-summary-row-name">
                  <a href="https://www.wowhead.com/tbc/item=${row.id}">${row.displayName}</a>
                  <div class="resto-summary-row-tag">${row.type}</div>
                </div>
                <div class="resto-summary-row-price">-</div>
                <div class="resto-summary-row-amount">AH qty: -</div>
                <div class="resto-summary-row-missing">Not found in this auction dataset</div>
              </div>
            `;
          }

          return `
            <div class="resto-summary-row">
              <div class="resto-summary-row-name">
                <a href="https://www.wowhead.com/tbc/item=${row.id}">${row.displayName}</a>
                <div class="resto-summary-row-tag">${row.type}</div>
              </div>
              <div class="resto-summary-row-price">${formatPrice(row.price)}</div>
              <div class="resto-summary-row-amount">AH qty: ${row.amount.toLocaleString()}</div>
            </div>
          `;
        })
        .join('');

      return `
        <div class="resto-summary-category">
          <div class="resto-summary-category-header">
            <div class="resto-summary-category-title">${category.name}</div>
            <div class="resto-summary-category-total">${formatPrice(category.subtotal)}</div>
          </div>
          ${rowsHtml}
        </div>
      `;
    })
    .join('');

  els.restoSummaryTotalPrice.innerHTML = formatPrice(summary.grandTotal);
  const statusMessage = `Matched ${summary.foundCount} of ${RESTO_SUMMARY_ITEMS.length} tracked items. Missing: ${summary.missingCount}.`;
  setRestoSummaryStatus(statusMessage, summary.missingCount > 0);
  refreshWowheadLinks();
}
