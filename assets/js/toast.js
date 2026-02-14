import { els } from './dom.js';

let toastTimeout;

export function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    els.toast.classList.remove('show');
  }, 1800);
}
