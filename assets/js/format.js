export function formatPrice(copper) {
  const g = Math.floor(copper / 10000);
  const s = Math.floor((copper % 10000) / 100);
  const c = copper % 100;
  const parts = [];

  if (g > 0) {
    parts.push(`<span class="gold">${g.toLocaleString()}g</span>`);
  }
  if (s > 0) {
    parts.push(`<span class="silver">${s}s</span>`);
  }
  if (c > 0 || parts.length === 0) {
    parts.push(`<span class="copper">${c}c</span>`);
  }

  return parts.join(' ');
}

export function formatUpdatedAt(value) {
  if (!value) {
    return 'Never';
  }

  let normalizedValue = value;
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    normalizedValue = Number(value);
  }

  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return date.toLocaleString();
}
