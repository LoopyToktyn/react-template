import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./App";
import "./styles/global.css"; // global CSS
import { AuthProvider } from "@context/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      onError: (error: unknown) => {
        // Could handle React Query errors globally if needed
        console.error("React Query Error:", error);
      }
    },
    mutations: {
      onError: (error: unknown) => {
        // Could handle React Query mutations errors globally if needed
        console.error("Mutation Error:", error);
      }
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
