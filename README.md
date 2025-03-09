# React Boilerplate

This is a comprehensive React boilerplate configured with the following technologies:

- **Webpack** for module bundling
- **TypeScript** for type safety
- **React Router** for routing
- **React Query** for server state management
- **Material UI** for UI components and theming
- **Axios** with a global instance for API calls
- **React Toastify** for notifications
- **ESLint & Prettier** for consistent code formatting

---

## Project Structure

```
.
├── .env                    # Environment variables
├── .eslintignore           # ESLint ignore rules
├── .eslintrc.js            # ESLint configuration
├── .gitignore              # Git ignore rules
├── .prettierrc             # Prettier configuration
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── webpack.config.js       # Webpack configuration
├── public/
│   ├── index.html          # Main HTML file
└── src/
    ├── api/                # Axios instance & API calls
    ├── components/         # Reusable UI components
    ├── context/            # Global state management
    ├── hooks/              # Custom React hooks
    ├── pages/              # Page components
    ├── styles/             # Global CSS and theming
    ├── utils/              # Utility functions
    ├── App.tsx             # Main app component
    ├── index.tsx           # Entry point
    ├── routes.tsx          # Centralized route definitions
    └── theme.ts            # Material UI theme configuration
```

---

## Getting Started

### 1. Install Dependencies

```sh
npm install
# or
yarn
```

### 2. Running the Development Server

```sh
npm run start
# or
yarn start
```

This will launch the app in development mode with Hot Module Replacement (HMR).

### 3. Building for Production

```sh
npm run build
# or
yarn build
```

This compiles the project into the `dist/` folder.

### 4. Running the Production Build

After building the project, you can serve the `dist/` folder locally using:

```sh
npm run dist
```

This will serve the production build at **http://localhost:3000** using the `serve` package.

### 5. Running Lint and Formatting

```sh
npm run lint
npm run format
```

### 6. Running with Different `.env` Configurations

- The app reads from `.env` for environment variables.
- To override, create additional files: `.env.development`, `.env.production`, etc.
- Example:
  ```sh
  REACT_APP_BASE_URL=https://api.example.com
  REACT_APP_ENABLE_AUTH=true
  ```
- Run the app with a specific environment:
  ```sh
  cross-env NODE_ENV=production npm start
  ```

---

## Context & Hooks Explanation

### `AuthContext.tsx` (Global Authentication State)

- Tracks whether authentication is enabled or disabled.
- Provides methods to toggle authentication.
- Example usage:
  ```tsx
  const { authEnabled, toggleAuth } = useAuthContext();
  ```

### `useAuth.ts` (Custom Authentication Hook)

- A wrapper around `AuthContext` for easier access.
- Used to check authentication status and toggle auth.

### `axiosInstance.ts` (Global Axios Instance)

- Configured with:
  - Base URL from `.env`
  - Auth token injection
  - Global error handling with Toastify
- Example usage:
  ```tsx
  import axiosInstance from "@api/axiosInstance";
  axiosInstance.get("/user");
  ```

### `routes.tsx` (Routing Configuration)

- Defines private and public routes.
- Checks authentication before allowing access.
- Supports role-based access control (RBAC).
- Redirects unauthorized users to `/login`.

### `theme.ts` (Material UI Theme)

- Customizes primary and secondary colors.
- Supports dark/light mode switching.

---

## Key Features

### 1. Authentication Handling

- Stores token in `localStorage`.
- Redirects unauthorized users.
- Easily disable authentication via `.env`.

### 2. React Query for Data Fetching

- Centralized query management.
- Global error handling with Toastify.
- Example usage:
  ```tsx
  import { useQuery } from "react-query";
  const { data, error } = useQuery("user", fetchUser);
  ```

### 3. Webpack Configuration

- Supports:
  - HMR for live updates.
  - Environment variable injection.
  - Code splitting for better performance.
  - Aliases (`@components`, `@api`, etc.).
