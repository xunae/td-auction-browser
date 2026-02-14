import { VIEW_SEARCH } from './constants.js';
import { state } from './state.js';
import { els } from './dom.js';
import { renderRestoSummary } from './resto-summary.js';

export function setView(view) {
  state.currentView = view;
  const isSearchView = view === VIEW_SEARCH;

  els.searchView.classList.toggle('view-hidden', !isSearchView);
  els.restoSummaryView.classList.toggle('view-hidden', isSearchView);
  els.tabSearch.classList.toggle('active', isSearchView);
  els.tabRestoSummary.classList.toggle('active', !isSearchView);
  els.tabSearch.setAttribute('aria-selected', isSearchView ? 'true' : 'false');
  els.tabRestoSummary.setAttribute('aria-selected', isSearchView ? 'false' : 'true');

  if (!isSearchView) {
    renderRestoSummary();
  }
}
