// src/CrudForm/useCrudForm.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import axiosInstance from "@api/axiosInstance";

export interface CrudConfig {
  path: string;
  op: "GET" | "POST" | "PUT" | "DELETE";
}

export interface CrudOptions<
  TApiResponse extends Record<string, any> = any,
  TApiRequest = any,
  TFormShape = any
> {
  id?: string;
  fetchConfig?: CrudConfig;
  createConfig?: CrudConfig;
  updateConfig?: CrudConfig;
  deleteConfig?: CrudConfig;
  defaults: TApiResponse;
  transformIn?: (data: TApiResponse) => TFormShape;
  transformOut?: (data: TFormShape) => TApiRequest;
  extraParams?: Record<string, any>;
}

export function useCrudForm<
  TApiResponse extends Record<string, any> = any,
  TApiRequest = any,
  TFormShape = any
>({
  id,
  fetchConfig,
  createConfig,
  updateConfig,
  deleteConfig,
  defaults,
  transformIn = (data) => data as unknown as TFormShape,
  transformOut = (data) => data as unknown as TApiRequest,
  extraParams,
}: CrudOptions<TApiResponse, TApiRequest, TFormShape>) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<TFormShape>(transformIn(defaults));

  const makeRequest = async (config?: CrudConfig, data?: any) => {
    if (!config) throw new Error("Request configuration is missing");
    const path = config.path.replace("{id}", id || "");
    try {
      switch (config.op) {
        case "GET":
          return (
            await axiosInstance.get<TApiResponse>(path, { params: extraParams })
          ).data;
        case "POST":
          return (
            await axiosInstance.post<TApiResponse>(path, data, {
              params: extraParams,
            })
          ).data;
        case "PUT":
          return (
            await axiosInstance.put<TApiResponse>(path, data, {
              params: extraParams,
            })
          ).data;
        case "DELETE":
          return (await axiosInstance.delete(path, { params: extraParams }))
            .data;
        default:
          throw new Error("Unsupported HTTP method");
      }
    } catch (err) {
      console.error(`${config.op} request error:`, err);
      throw err;
    }
  };

  // Fetch data
  const {
    data,
    error,
    isPending: isLoading,
  } = useQuery({
    queryKey: ["fetchData", id, extraParams],
    queryFn: async () => {
      if (!id || !fetchConfig) return defaults;
      return transformIn(await makeRequest(fetchConfig));
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (data) {
      setFormData((prev) => ({ ...prev, ...data }));
    }
  }, [data]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (newData: TFormShape) => {
      if (!createConfig) throw new Error("Create configuration is missing");
      return makeRequest(createConfig, transformOut(newData));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fetchData"] }),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedData: TFormShape) => {
      if (!id) throw new Error("No ID provided for update.");
      if (!updateConfig) throw new Error("Update configuration is missing");
      return makeRequest(updateConfig, transformOut(updatedData));
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["fetchData", id] }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("No ID provided for delete.");
      if (!deleteConfig) throw new Error("Delete configuration is missing");
      return makeRequest(deleteConfig);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fetchData"] }),
  });

  return {
    formData,
    setFormData,
    isLoading,
    error,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
  };
}
