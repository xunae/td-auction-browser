import { RESULTS_PAGE_SIZE } from './constants.js';
import { state } from './state.js';
import { els } from './dom.js';
import { formatPrice } from './format.js';
import { refreshWowheadLinks } from './tooltip.js';
import { addToCartById } from './cart.js';

export function renderResults(filteredItems) {
  if (filteredItems.length === 0) {
    els.results.innerHTML = '';
    return;
  }

  els.results.innerHTML = filteredItems
    .map(
      (item) => `
        <div class="item-row">
          <div class="item-name"><a href="https://www.wowhead.com/tbc/item=${encodeURIComponent(item.id)}">${item.name}</a></div>
          <div class="item-price">${formatPrice(item.price)}</div>
          <div class="item-amount">x${item.amount.toLocaleString()}</div>
          <button class="add-btn" type="button" data-action="add-to-cart" data-id="${item.id}" title="Add to shopping list">+</button>
        </div>
      `,
    )
    .join('');

  refreshWowheadLinks();
}

export function updatePagination() {
  if (state.currentResults.length === 0) {
    els.resultsPagination.style.display = 'none';
    return;
  }

  const totalPages = Math.ceil(state.currentResults.length / RESULTS_PAGE_SIZE);
  els.resultsPagination.style.display = 'flex';
  els.resultsPageText.textContent = `${state.currentPage} of ${totalPages}`;
  els.resultsPrevBtn.disabled = state.currentPage <= 1;
  els.resultsNextBtn.disabled = state.currentPage >= totalPages;
}

export function renderCurrentPage() {
  if (state.currentResults.length === 0) {
    renderResults([]);
    updatePagination();
    return;
  }

  const start = (state.currentPage - 1) * RESULTS_PAGE_SIZE;
  const pageItems = state.currentResults.slice(start, start + RESULTS_PAGE_SIZE);
  renderResults(pageItems);
  updatePagination();
}

export function search(query) {
  if (!state.hasAuctionData) {
    state.currentResults = [];
    state.currentPage = 1;
    renderCurrentPage();
    return;
  }

  if (!query.trim()) {
    state.currentResults = [];
    state.currentPage = 1;
    renderCurrentPage();
    return;
  }

  const q = query.toLowerCase();
  state.currentResults = state.items
    .filter((item) => item.name.toLowerCase().includes(q))
    .map((item) => {
      const lower = item.name.toLowerCase();
      const isExact = lower === q;
      return { item, isExact };
    })
    .sort((a, b) => {
      if (a.isExact !== b.isExact) {
        return a.isExact ? -1 : 1;
      }

      const lengthDiff = a.item.name.length - b.item.name.length;
      if (lengthDiff !== 0) {
        return lengthDiff;
      }

      return a.item.name.localeCompare(b.item.name);
    })
    .map((result) => result.item);

  state.currentPage = 1;
  renderCurrentPage();
}

export function handleResultsClick(event) {
  const addButton = event.target.closest('button[data-action="add-to-cart"]');
  if (!addButton) {
    return;
  }

  addToCartById(addButton.dataset.id);
}
