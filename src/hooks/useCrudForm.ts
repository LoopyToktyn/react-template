// src/CrudForm/useCrudForm.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  UserFormShape,
  UserApiRequest,
  UserApiResponse,
} from "@components/CrudForm";

export interface CrudOptions {
  id?: string;
  fetchFn?: (
    id: string,
    extraParams?: Record<string, any>
  ) => Promise<UserApiResponse>;
  createFn: (
    data: UserApiRequest,
    extraParams?: Record<string, any>
  ) => Promise<UserApiResponse>;
  updateFn: (
    id: string,
    data: UserApiRequest,
    extraParams?: Record<string, any>
  ) => Promise<UserApiResponse>;
  defaults: UserApiResponse;
  transformIn: (data: UserApiResponse) => UserFormShape;
  transformOut: (data: UserFormShape) => UserApiRequest;
  extraParams?: Record<string, any>;
}

export function useCrudForm({
  id,
  fetchFn,
  createFn,
  updateFn,
  defaults,
  transformIn,
  transformOut,
  extraParams,
}: CrudOptions) {
  const queryClient = useQueryClient();

  // Fetch data if editing an existing item.
  const {
    data: apiData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["item", id],
    queryFn: () =>
      id && fetchFn ? fetchFn(id, extraParams) : Promise.resolve(defaults),
    enabled: !!id,
    initialData: defaults,
  });

  // Convert API response into form state.
  const initialFormState = transformIn(apiData);
  const [formState, setFormState] = useState<UserFormShape>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormState(transformIn(apiData));
  }, [apiData, transformIn]);

  // Validation utility.
  const validate = (
    state: UserFormShape,
    fieldValidators: Record<string, (value: any) => string | null>
  ) => {
    const newErrors: Record<string, string> = {};
    for (const key in fieldValidators) {
      const error = fieldValidators[key](state[key]);
      if (error) {
        newErrors[key] = error;
      }
    }
    setErrors(newErrors);
    return newErrors;
  };

  // Create mutation.
  const createMutation = useMutation({
    mutationFn: () => createFn(transformOut(formState), extraParams),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setFormState(transformIn(newItem));
    },
  });

  // Update mutation.
  const updateMutation = useMutation({
    mutationFn: () =>
      updateFn(id as string, transformOut(formState), extraParams),
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setFormState(transformIn(updatedItem));
    },
  });

  const handleChange = (name: string, value: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (
    e: React.FormEvent,
    fieldValidators: Record<string, (value: any) => string | null> = {}
  ) => {
    e.preventDefault();
    const validationErrors = validate(formState, fieldValidators);
    if (Object.keys(validationErrors).length > 0) return;
    id ? updateMutation.mutate() : createMutation.mutate();
  };

  return {
    formState,
    setFormState,
    handleChange,
    handleSubmit,
    isLoading,
    error,
    errors,
  };
}
