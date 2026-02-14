# Repository Guidelines

## Project Structure & Module Organization
This repository is a static browser app with modular assets:
- `index.html`: page structure and static asset references.
- `assets/css/app.css`: all application styles.
- `assets/js/main.js`: bootstrap and event wiring only.
- `assets/js/constants.js`: shared constants and curated item config.
- `assets/js/state.js`: shared runtime state.
- `assets/js/dom.js`: centralized DOM element references.
- `assets/js/storage.js`: localStorage persistence.
- `assets/js/format.js`: shared formatting helpers.
- `assets/js/toast.js`: toast notifications.
- `assets/js/cart.js`: shopping-list logic and cart rendering.
- `assets/js/search.js`: search, sorting, and pagination rendering.
- `assets/js/resto-summary.js`: resto summary compute/render logic.
- `assets/js/data-source.js`: data parsing/loading/modal flow.
- `assets/js/views.js`: tab/view switching.

Keep concerns in their module. Avoid adding feature logic to `main.js` beyond wiring and startup.

## Build, Test, and Development Commands
No build step or package manager is required.
- `python3 -m http.server 8080`: serve locally at `http://localhost:8080`.
- `xdg-open http://localhost:8080` (optional): open the app in a browser.

Because this app uses ES modules, run it over HTTP (`python3 -m http.server`), not via `file://`.

Use browser DevTools for debugging (`Console`, `Network`, and `Application > Local Storage`).

## Coding Style & Naming Conventions
- Use 2-space indentation in HTML, CSS, and JavaScript.
- Prefer `const`/`let` and single quotes in JavaScript.
- Keep constants uppercase snake case (for example, `CART_STORAGE_KEY`).
- Use kebab-case for CSS classes/IDs (for example, `.cart-item-remove`, `#data-source-modal`).
- Keep functions focused and verb-based (`loadCart`, `renderCart`, `updateBadge`).
- Prefer named exports/imports across modules; avoid default exports.

## Testing Guidelines
No automated testing is set up. Use manual browser testing.

Run this regression checklist before finishing changes:
- Load valid `data.xml`, confirm search enables and status/updated time update.
- Search and paginate results; verify sorting and page buttons.
- Add/remove/update cart quantities and confirm totals/badge.
- Save data, reload page, and verify persisted data/cart state.
- Clear saved data and verify disabled search + modal guidance.
- Switch Search/Resto Summary tabs and verify summary rendering.
- Verify modal close behaviors (close button, overlay click, Escape key).
