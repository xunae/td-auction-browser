import {
  CART_STORAGE_KEY,
  DATA_STORAGE_KEY,
  DATA_UPDATED_AT_KEY,
} from './constants.js';

export function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

export function loadStoredAuctionData() {
  return {
    text: localStorage.getItem(DATA_STORAGE_KEY),
    updatedAt: localStorage.getItem(DATA_UPDATED_AT_KEY),
  };
}

export function saveStoredAuctionData(text, updatedAt) {
  localStorage.setItem(DATA_STORAGE_KEY, text);
  localStorage.setItem(DATA_UPDATED_AT_KEY, String(updatedAt));
}

export function clearStoredAuctionData() {
  localStorage.removeItem(DATA_STORAGE_KEY);
  localStorage.removeItem(DATA_UPDATED_AT_KEY);
}
