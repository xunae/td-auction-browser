export function refreshWowheadLinks() {
  if (window.$WowheadPower && window.$WowheadPower.refreshLinks) {
    window.$WowheadPower.refreshLinks();
  }
}
