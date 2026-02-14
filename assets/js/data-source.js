import { state } from './state.js';
import { els } from './dom.js';
import { formatUpdatedAt } from './format.js';
import {
  loadStoredAuctionData,
  clearStoredAuctionData,
} from './storage.js';
import { syncCartWithAuctionData, renderCart } from './cart.js';
import { search, renderCurrentPage } from './search.js';
import { renderRestoSummary } from './resto-summary.js';

export function parseLine(line) {
  const match = line.match(/^(\d+),(\d+),"([^"]+)","[^"]*","[^"]*",(\d+)$/);
  if (!match) {
    return null;
  }

  return {
    id: parseInt(match[1], 10),
    price: parseInt(match[2], 10),
    name: match[3],
    amount: parseInt(match[4], 10),
  };
}

export function setDataStatus(message, isError = false) {
  els.dataStatus.textContent = message;
  els.dataStatus.classList.toggle('error', isError);
}

function setDataUpdatedAt(value) {
  els.dataUpdatedAt.textContent = formatUpdatedAt(value);
}

export function parseDataText(text) {
  const parsedItems = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const parsed = parseLine(line.trim());
    if (parsed) {
      parsedItems.push(parsed);
    }
  }

  return parsedItems;
}

export function applyDataText(text, sourceLabel, updatedAt) {
  const parsedItems = parseDataText(text);
  if (parsedItems.length === 0) {
    throw new Error('No valid rows found. Expected data.xml row format.');
  }

  state.items = parsedItems;
  state.hasAuctionData = true;

  syncCartWithAuctionData();
  renderCart();

  els.search.disabled = false;
  els.search.placeholder = 'Search items...';
  search(els.search.value);

  setDataUpdatedAt(updatedAt);
  setDataStatus(`Loaded ${state.items.length.toLocaleString()} items from ${sourceLabel}.`);
  renderRestoSummary();
}

export function clearAuctionDataState() {
  state.items = [];
  state.hasAuctionData = false;
  state.currentResults = [];
  state.currentPage = 1;

  els.search.disabled = true;
  els.search.value = '';
  els.search.placeholder = 'Load auction data first...';

  renderCurrentPage();
  setDataUpdatedAt(null);
  renderRestoSummary();
}

export function openDataSourceModal() {
  els.dataSourceModal.classList.add('open');
  els.dataSourceOverlay.classList.add('open');
}

export function closeDataSourceModal() {
  els.dataSourceModal.classList.remove('open');
  els.dataSourceOverlay.classList.remove('open');
}

export function initializeData() {
  const stored = loadStoredAuctionData();

  if (stored.text) {
    try {
      applyDataText(stored.text, 'saved browser data', stored.updatedAt);
      els.dataInput.value = stored.text;
      return;
    } catch (error) {
      console.error(error);
      clearStoredAuctionData();
      clearAuctionDataState();
      setDataStatus(
        'Saved browser data was invalid. Please paste or load a valid data.xml.',
        true,
      );
      openDataSourceModal();
      return;
    }
  }

  clearAuctionDataState();
  setDataStatus(
    'No auction data loaded. Paste or load data.xml, then click "Save and Use Data".',
    true,
  );
  openDataSourceModal();
}
