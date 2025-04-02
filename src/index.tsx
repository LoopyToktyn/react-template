// src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import {
  DefaultOptions,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import App from "@root/App";
import { AuthProvider } from "@context/AuthContext";
import { LoadingProvider } from "@context/LoadingContext";
import { ColorModeProvider } from "@context/ColorModeContext";
import axiosInstance from "@api/axiosInstance";

import "@styles/global.css";
import { registerQueryClient } from "@api/lookupService";
import { FormStateProvider } from "./context/FormContext";

const defaultQueryFn = async ({
  queryKey,
}: {
  queryKey: readonly unknown[];
}) => {
  // Cast queryKey to any[] so we can destructure it as before.
  const [, config = {}] = queryKey as any[];
  const { path, method = "GET", params = {}, body = {} } = config;

  // Decide how to send data: GET → params, else → body.
  const isGet = method.toUpperCase() === "GET";
  const response = await axiosInstance.request({
    url: path,
    method,
    ...(isGet ? { params } : { data: body }),
  });

  return response.data;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 2,
    },
  } as DefaultOptions,
});

registerQueryClient(queryClient); // For sync lookup service

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ColorModeProvider>
          <LoadingProvider>
            <AuthProvider>
              <FormStateProvider>
                <App />
              </FormStateProvider>
            </AuthProvider>
          </LoadingProvider>
        </ColorModeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
