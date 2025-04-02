// src/CrudForm/useCrudForm.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFormState } from "@context/FormContext";
import axiosInstance from "@api/axiosInstance";

type CrudOp = "GET" | "POST" | "PUT" | "DELETE";

export type CrudRequestConfig<FormShape> =
  | {
      path: string;
      op: CrudOp;
      params?: Record<string, any>;
      data?: any;
    }
  | ((formState: FormShape) => Promise<any>);

interface UseCrudFormOptions<FormShape> {
  id?: string;
  defaults: Partial<FormShape>;
  formKey?: string;
  fetch?: CrudRequestConfig<FormShape>;
  create?: CrudRequestConfig<FormShape>;
  update?: CrudRequestConfig<FormShape>;
  delete?: CrudRequestConfig<FormShape>;
}

export function useCrudForm<FormShape extends Record<string, any> = any>({
  id,
  defaults,
  formKey: customKey,
  fetch,
  create,
  update,
  delete: del,
}: UseCrudFormOptions<FormShape>) {
  const queryClient = useQueryClient();
  const formKey = customKey || window.location.pathname;
  const { getFormState, setFormState, clearFormState } = useFormState();

  const formData: FormShape =
    (getFormState(formKey) as FormShape) || (defaults as FormShape);

  const resolveCall = async (
    cfg: CrudRequestConfig<FormShape> | undefined,
    data?: any
  ): Promise<any> => {
    if (!cfg) throw new Error("Missing configuration");

    if (typeof cfg === "function") {
      return cfg(formData);
    }

    const { path, op, params, data: overrideData } = cfg;
    const resolvedPath = path.replace("{id}", id || "");

    switch (op) {
      case "GET":
        return (await axiosInstance.get(resolvedPath, { params })).data;
      case "POST":
        return (
          await axiosInstance.post(resolvedPath, overrideData ?? data, {
            params,
          })
        ).data;
      case "PUT":
        return (
          await axiosInstance.put(resolvedPath, overrideData ?? data, {
            params,
          })
        ).data;
      case "DELETE":
        return (await axiosInstance.delete(resolvedPath, { params })).data;
      default:
        throw new Error(`Unsupported operation: ${op}`);
    }
  };

  const {
    data,
    error,
    isPending: isLoading,
  } = useQuery({
    queryKey: ["fetchData", id],
    queryFn: async () => {
      if (!id || !fetch) return defaults;
      return resolveCall(fetch);
    },
    enabled: !!id && !!fetch,
  });

  useEffect(() => {
    if (data && !getFormState(formKey)) {
      setFormState(formKey, data);
    }
  }, [data, setFormState, getFormState, formKey]);

  const createMutation = useMutation({
    mutationFn: async (newData: FormShape) => {
      if (!create) throw new Error("Create configuration is missing");
      return resolveCall(create, newData);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fetchData"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedData: FormShape) => {
      if (!id) throw new Error("No ID provided for update.");
      if (!update) throw new Error("Update configuration is missing");
      return resolveCall(update, updatedData);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["fetchData", id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("No ID provided for delete.");
      if (!del) throw new Error("Delete configuration is missing");
      return resolveCall(del);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fetchData"] }),
  });

  const resetForm = () => {
    clearFormState(formKey);
  };

  return {
    formData,
    setFormData: (data: FormShape) => setFormState(formKey, data),
    isLoading,
    error,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    resetForm,
  };
}
