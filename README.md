# Your React CRUD/Search Boilerplate

Welcome to the **Your React CRUD/Search Boilerplate**! This project provides an opinionated, yet flexible, starting point for building data-driven React applications with CRUD, search functionality, and theming built-in.

## Overview

- **Frontend:** React (TypeScript), React Router, [MUI](https://mui.com/) (Material UI), TanStack React Query, React Toastify
- **Tooling:** Webpack 5, Babel, TypeScript, ESLint/Prettier, Docker/Docker Compose

### Project Structure

```
.
├── .eslintignore           # ESLint ignore rules
├── .eslintrc.js            # ESLint configuration
├── .gitignore              # Git ignore rules
├── .prettierrc             # Prettier configuration
├── Dockerfile              # Docker image configuration
├── docker-compose.yml      # Docker orchestration
├── entrypoint.sh           # Startup script for Docker
├── env-config.template.js  # Template for runtime env injection
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── webpack.config.js       # Webpack configuration
├── public/
│   ├── index.html          # Main HTML file
│   └── env-config.js       # Injected environment config (local runtime)
└── src/
    ├── api/                # Axios instance & API calls
    ├── assets/             # Static assets like images
    ├── components/         # Reusable UI components
    ├── config/             # Route & menu configuration
    ├── context/            # Global state management (Contexts)
    ├── hooks/              # Custom React hooks (CRUD/Search)
    ├── pages/              # Page components
    ├── styles/             # Global CSS and theming
    ├── utils/              # Utility functions (auth, logger, etc.)
    ├── App.tsx             # Main app component
    ├── index.tsx           # Entry point
    ├── routes.tsx          # Centralized route definitions
    ├── theme.ts            # Material UI theme configuration
    ├── types.ts            # Shared TypeScript types
    ├── global.d.ts         # Global type declarations
    └── images.d.ts         # Static image module declarations
```

## Key Features

1. **CRUD and Search Hooks**  
   Prebuilt hooks like `useCrudForm` and `useSearchForm` to standardize how you handle form state, searching, and reactivity.

2. **Centralized Theming**  
   The project uses [MUI’s theme customization](https://mui.com/material-ui/customization/theming/) for consistent styling.

3. **React Query Integration**  
   The boilerplate sets up [React Query](https://tanstack.com/query/latest) for API data fetching, caching, and managing server state.

4. **Authentication Context**  
   A simple `AuthContext` demonstrates how to integrate authentication globally.

5. **Environment Configuration**  
   Uses `env-config.js` for environment variables with Docker & local setups.

6. **Dockerized Development**  
   Ready-to-go Docker Compose config for local dev or production builds. No more “But it worked on my machine!”

## Getting Started

### Prerequisites

- **Node.js** (recommended version 16+)
- **Docker** (optional, if you want to run in containers)
- **npm or yarn** (to install local dependencies)

### Quick Start (Local)

1. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn
   ```

2. **Start development server:**

   ```bash
   npm run start
   # or
   yarn start
   ```

   This spins up a local Webpack dev server on [http://localhost:8080](http://localhost:8080).

3. **Build for production:**

   ```bash
   npm run build
   # or
   yarn build
   ```

   The production build outputs to the `dist` folder.

### Using Docker

1. **Local Dev with Docker Compose:**

   ```bash
   npm run dev:docker
   # or
   yarn dev:docker
   ```

   This sets up the local environment on Docker, including an NGINX server that hosts your React app.

2. **Production Build with Docker Compose:**
   ```bash
   npm run prod:docker
   # or
   yarn prod:docker
   ```
   This runs a production-grade build in Docker.  
   If you just want to stop all containers:
   ```bash
   npm run docker:down
   # or
   yarn docker:down
   ```

### Scripts

All scripts are defined in `package.json`:

- `npm run start` / `yarn start` – Start local dev server (non-Docker).
- `npm run build` / `yarn build` – Production build to `dist`.
- `npm run lint` / `yarn lint` – Run ESLint checks.
- `npm run format` / `yarn format` – Auto-format with Prettier.
- `npm run dev:docker` / `yarn dev:docker` – Docker Compose up (development).
- `npm run prod:docker` / `yarn prod:docker` – Docker Compose up (production).
- `npm run docker:down` / `yarn docker:down` – Stop containers.

## Contributing

1. **Fork** or create a new branch.
2. **Commit** changes with descriptive messages.
3. **Open a PR** for review.

We use **ESLint** + **Prettier** to maintain a consistent code style. When in doubt, run `npm run format` before pushing commits.

## Next Steps

- Dive into the [**Detailed Documentation**](./docs/README.md) to learn more about the hooks, contexts, and how to extend this boilerplate.
- Explore the project structure inside `src/` to see examples of the included patterns.
