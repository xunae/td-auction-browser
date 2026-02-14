import { RESULTS_PAGE_SIZE, VIEW_RESTO_SUMMARY, VIEW_SEARCH } from './constants.js';
import { state } from './state.js';
import { els } from './dom.js';
import {
  loadCart,
  saveStoredAuctionData,
  clearStoredAuctionData,
} from './storage.js';
import {
  renderCart,
  updateBadge,
  openCart,
  closeCart,
  clearCart,
  handleCartItemsClick,
  handleCartItemsChange,
  handleCartItemsKeydown,
} from './cart.js';
import { search, renderCurrentPage, handleResultsClick } from './search.js';
import {
  openDataSourceModal,
  closeDataSourceModal,
  setDataStatus,
  applyDataText,
  clearAuctionDataState,
  initializeData,
} from './data-source.js';
import { setView } from './views.js';
import { showToast } from './toast.js';

window.whTooltips = {
  colorLinks: true,
  iconizeLinks: true,
  iconSize: 'small',
};

function bindEvents() {
  els.search.addEventListener('input', (event) => {
    search(event.target.value);
  });

  els.tabSearch.addEventListener('click', () => {
    setView(VIEW_SEARCH);
  });

  els.tabRestoSummary.addEventListener('click', () => {
    setView(VIEW_RESTO_SUMMARY);
  });

  els.resultsPrevBtn.addEventListener('click', () => {
    if (state.currentPage <= 1) {
      return;
    }

    state.currentPage -= 1;
    renderCurrentPage();
  });

  els.resultsNextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(state.currentResults.length / RESULTS_PAGE_SIZE);
    if (state.currentPage >= totalPages) {
      return;
    }

    state.currentPage += 1;
    renderCurrentPage();
  });

  els.dataSourceToggle.addEventListener('click', openDataSourceModal);
  els.dataSourceCloseBtn.addEventListener('click', closeDataSourceModal);
  els.dataSourceOverlay.addEventListener('click', closeDataSourceModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDataSourceModal();
    }
  });

  els.dataFile.addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      els.dataInput.value = text;
      setDataStatus(`Loaded file "${file.name}". Click "Save and Use Data" to apply.`);
    } catch (error) {
      console.error(error);
      setDataStatus('Could not read the selected file.', true);
    }
  });

  els.saveDataBtn.addEventListener('click', () => {
    const text = els.dataInput.value.trim();
    if (!text) {
      setDataStatus('Paste or load data.xml content first.', true);
      return;
    }

    try {
      const updatedAt = Date.now();
      applyDataText(text, 'saved browser data', updatedAt);
      saveStoredAuctionData(text, updatedAt);
      showToast('Auction data saved locally');
      closeDataSourceModal();
    } catch (error) {
      console.error(error);
      setDataStatus(error.message, true);
    }
  });

  els.clearDataBtn.addEventListener('click', () => {
    clearStoredAuctionData();
    els.dataInput.value = '';
    clearAuctionDataState();
    setDataStatus(
      'Saved data cleared. Paste or load data.xml, then click "Save and Use Data".',
    );
    showToast('Saved auction data cleared');
    openDataSourceModal();
  });

  els.cartToggle.addEventListener('click', openCart);
  els.cartCloseBtn.addEventListener('click', closeCart);
  els.cartOverlay.addEventListener('click', closeCart);

  els.cartClearBtn.addEventListener('click', () => {
    if (confirm('Clear your entire shopping list?')) {
      clearCart();
    }
  });

  els.results.addEventListener('click', handleResultsClick);
  els.cartItems.addEventListener('click', handleCartItemsClick);
  els.cartItems.addEventListener('change', handleCartItemsChange);
  els.cartItems.addEventListener('keydown', handleCartItemsKeydown);
}

function bootstrap() {
  state.cart = loadCart();

  bindEvents();

  renderCart();
  updateBadge();
  setView(VIEW_SEARCH);
  initializeData();
}

bootstrap();
