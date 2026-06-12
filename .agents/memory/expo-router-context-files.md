---
name: expo-router context files
description: Files placed inside app/ directory in Expo Router are treated as routes and need a default export
---

The rule: Any `.tsx` file placed inside `artifacts/mobile/app/` (including subdirectories like `app/context/`) is treated as a route by Expo Router and must have a default export of a React component.

**Why:** Expo Router uses file-system routing. It warns "Route X is missing the required default export" and fails to render if a file in `app/` lacks a default export — even if it's a context/utility file, not meant to be a page.

**How to apply:** For context providers like `AppContext.tsx`, add `export default AppProvider` at the bottom. Alternatively, move non-route files to `src/` or `lib/` directories outside of `app/`.
