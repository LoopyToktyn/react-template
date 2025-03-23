# Developer Documentation

This section dives deeper into the architecture of this boilerplate. It's aimed at developers who want to extend or maintain the project.

## Overview

This project is structured around clean separation of concerns, with utilities and state split into functional domains. Below you'll find documentation for each of the most important architectural areas.

---

## 🔧 Hooks

Reusable React Hooks to streamline CRUD and search behavior.

### `useCrudForm.ts`

Manages form state for Create/Read/Update/Delete operations.

- Automatically handles loading state, reset, validation triggers.
- Designed to be consumed by `FormRenderer` and similar components.

### `useSearchForm.ts`

Centralized search and filter logic for query-based listing pages.

- Integrates with `react-query` and a customizable search API.

➡️ See: [`src/hooks/`](../src/hooks)

---

## 🌐 Context

React Context providers for app-wide concerns.

### `AuthContext.tsx`

Holds current user session info and exposes auth-related actions.

- Example: `login`, `logout`, `getUser()`
- Used across the app to enforce route protection.

### `ColorModeContext.tsx`

Dark/light mode toggling using MUI theming.

- Uses MUI's built-in `createTheme`.
- Syncs with browser/system preferences.

### `LoadingContext.tsx`

Simple context to indicate global loading state.

- Set loading overlays on API transitions or major view changes.

➡️ See: [`src/context/`](../src/context)

---

## 🧩 Components

Shared, opinionated UI components that work out of the box with the custom hooks and API shape.

### Notable Components

- `SearchForm.tsx` – Dynamic search+results layout that hooks into `useSearchForm`.
- `FormRenderer.tsx` – Renders a dynamic form layout based on schema/config.
- `Table.tsx` – Standardized table with pagination and selection logic.
- `AppLayout.tsx` – The main layout wrapper (header/footer/sidebar).
- `Menu.tsx` & `Header.tsx` – Main navigation elements.

➡️ See: [`src/components/`](../src/components)

---

## 📡 API

### `axiosInstance.ts`

Preconfigured Axios instance:

- Includes interceptors for auth token injection, error handling, etc.
- Easily extendable with helper functions or service modules.

➡️ See: [`src/api/`](../src/api)

---

## ⚙️ Config

### `routeConfig.tsx`

Defines routes and paths with React Router v6-style syntax.

- Handles protected routes and layout bindings.

### `menuConfig.tsx`

Maps route config to navigation menus.

- Used by `Menu.tsx` and `Header.tsx` to generate UI nav dynamically.

➡️ See: [`src/config/`](../src/config)

---

## What's Next

- To add a new CRUD view, start by creating a new page in `src/pages/`, rapidly scaffold it using the `FormRenderer`, and hook it into the `routerConfig` and `menuConfig`.
- For a new search UI, use `SearchForm` to rapidly scaffold it.
- Custom themes and global styles can be configured in [`theme.ts`](../src/theme.ts) and [`styles/global.css`](../src/styles/global.css).

---

> Looking to contribute? See the [Root README](../README.md) for setup instructions.
