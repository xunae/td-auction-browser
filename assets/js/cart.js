import { state } from './state.js';
import { els } from './dom.js';
import { formatPrice } from './format.js';
import { saveCart } from './storage.js';
import { refreshWowheadLinks } from './tooltip.js';
import { showToast } from './toast.js';

function persistAndRenderCart() {
  saveCart(state.cart);
  renderCart();
  updateBadge();
}

function toItemId(value) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

export function addToCart(item, options = {}) {
  const existing = state.cart.find((cartItem) => cartItem.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: 1,
    });
  }

  persistAndRenderCart();

  if (options.showToast !== false) {
    showToast(`Added ${item.name}`);
  }
}

export function addToCartById(itemId) {
  const normalizedId = toItemId(itemId);
  if (normalizedId === null) {
    return;
  }

  const item = state.items.find((entry) => entry.id === normalizedId);
  if (!item) {
    return;
  }

  addToCart({
    id: item.id,
    name: item.name,
    price: item.price,
  });
}

export function removeFromCart(itemId) {
  const normalizedId = toItemId(itemId);
  if (normalizedId === null) {
    return;
  }

  state.cart = state.cart.filter((item) => item.id !== normalizedId);
  persistAndRenderCart();
}

export function updateQty(itemId, delta) {
  const normalizedId = toItemId(itemId);
  if (normalizedId === null) {
    return;
  }

  const item = state.cart.find((cartItem) => cartItem.id === normalizedId);
  if (!item) {
    return;
  }

  item.qty += delta;
  if (item.qty < 1) {
    removeFromCart(normalizedId);
    return;
  }

  persistAndRenderCart();
}

export function setQty(itemId, value) {
  const normalizedId = toItemId(itemId);
  if (normalizedId === null) {
    return;
  }

  const qty = parseInt(value, 10);
  if (!qty || qty < 1) {
    removeFromCart(normalizedId);
    return;
  }

  const item = state.cart.find((cartItem) => cartItem.id === normalizedId);
  if (!item) {
    return;
  }

  item.qty = qty;
  persistAndRenderCart();
}

export function clearCart() {
  state.cart = [];
  persistAndRenderCart();
}

export function syncCartWithAuctionData() {
  if (!state.hasAuctionData || state.cart.length === 0) {
    return;
  }

  const itemsById = new Map(state.items.map((item) => [item.id, item]));
  let changed = false;

  state.cart = state.cart.map((cartItem) => {
    const latestItem = itemsById.get(cartItem.id);
    if (!latestItem) {
      return cartItem;
    }

    if (cartItem.price !== latestItem.price || cartItem.name !== latestItem.name) {
      changed = true;
      return {
        ...cartItem,
        price: latestItem.price,
        name: latestItem.name,
      };
    }

    return cartItem;
  });

  if (changed) {
    saveCart(state.cart);
  }
}

export function getCartTotal() {
  return state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function updateBadge() {
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
  if (count > 0) {
    els.cartBadge.style.display = 'flex';
    els.cartBadge.textContent = count > 99 ? '99+' : count;
  } else {
    els.cartBadge.style.display = 'none';
  }
}

export function renderCart() {
  if (state.cart.length === 0) {
    els.cartItems.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">📜</div>
        <div>Your shopping list is empty</div>
        <div style="font-size: 12px; color: #444;">Search for items and click + to add</div>
      </div>
    `;
    els.cartFooter.style.display = 'none';
    return;
  }

  els.cartItems.innerHTML = state.cart
    .map(
      (item) => `
        <div class="cart-item">
          <div class="cart-item-info">
            <div class="cart-item-name"><a href="https://www.wowhead.com/tbc/item=${item.id}">${item.name}</a></div>
            <div class="cart-item-unit">${formatPrice(item.price)} each</div>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn" type="button" data-action="cart-decrement" data-id="${item.id}">−</button>
            <input
              type="number"
              class="qty-display"
              value="${item.qty}"
              min="1"
              data-action="cart-set-qty"
              data-id="${item.id}"
            />
            <button class="qty-btn" type="button" data-action="cart-increment" data-id="${item.id}">+</button>
          </div>
          <div class="cart-item-subtotal">${formatPrice(item.price * item.qty)}</div>
          <button class="cart-item-remove" type="button" data-action="cart-remove" data-id="${item.id}" title="Remove">✕</button>
        </div>
      `,
    )
    .join('');

  els.cartFooter.style.display = 'block';
  els.cartTotalPrice.innerHTML = formatPrice(getCartTotal());
  refreshWowheadLinks();
}

export function openCart() {
  els.cartPanel.classList.add('open');
  els.cartOverlay.classList.add('open');
  renderCart();
}

export function closeCart() {
  els.cartPanel.classList.remove('open');
  els.cartOverlay.classList.remove('open');
}

export function handleCartItemsClick(event) {
  const actionElement = event.target.closest('[data-action]');
  if (!actionElement) {
    return;
  }

  const { action, id } = actionElement.dataset;
  if (!id) {
    return;
  }

  if (action === 'cart-decrement') {
    updateQty(id, -1);
    return;
  }

  if (action === 'cart-increment') {
    updateQty(id, 1);
    return;
  }

  if (action === 'cart-remove') {
    removeFromCart(id);
  }
}

export function handleCartItemsChange(event) {
  const input = event.target.closest('input[data-action="cart-set-qty"]');
  if (!input) {
    return;
  }

  setQty(input.dataset.id, input.value);
}

export function handleCartItemsKeydown(event) {
  if (
    event.key === 'Enter' &&
    event.target.matches('input[data-action="cart-set-qty"]')
  ) {
    event.target.blur();
  }
}
