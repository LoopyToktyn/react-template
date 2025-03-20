// src/CrudForm/CrudForm.tsx

import React from "react";
import { useCrudForm, CrudOptions } from "@hooks/useCrudForm";
import { FormConfigDictionary } from "@root/types";
import { ApiRequest, ApiResponse, FormShape } from "@root/types";
import FormRenderer from "./FormRenderer";

export interface UserApiRequest extends ApiRequest {
  name: string;
  email: string;
  description?: string;
  gender?: string;
  subscribe?: boolean;
  country?: string;
  skills?: string[];
  addresses?: string[];
  customData?: { option: string; checked: boolean };
}

export interface UserApiResponse extends ApiResponse {
  name: string;
  email: string;
  description: string;
  gender: string;
  subscribe: boolean;
  country: string;
  skills: string[];
  addresses: string[];
  customData: { option: string; checked: boolean };
}

export interface UserFormShape extends FormShape {
  name: string;
  email: string;
  description: string;
  gender: string;
  subscribe: boolean;
  country: string;
  skills: string[];
  addresses: string[];
  customData: { option: string; checked: boolean };
}

export interface CrudFormProps {
  id?: string;
  fetchFn?: CrudOptions["fetchFn"];
  createFn: CrudOptions["createFn"];
  updateFn: CrudOptions["updateFn"];
  defaults: UserApiResponse;
  transformIn: (data: UserApiResponse) => UserFormShape;
  transformOut: (data: UserFormShape) => UserApiRequest;
  extraParams?: Record<string, any>;
  formConfig: FormConfigDictionary;
  layoutConfig?: any; // Layout config remains as before.
  getValidators?: (
    formConfig: FormConfigDictionary
  ) => Record<string, (value: any) => string | null>;
}

export function CrudForm({
  id,
  fetchFn,
  createFn,
  updateFn,
  defaults,
  transformIn,
  transformOut,
  extraParams,
  formConfig,
  layoutConfig,
  getValidators,
}: CrudFormProps) {
  const {
    formState,
    setFormState,
    handleChange,
    handleSubmit,
    isLoading,
    error,
    errors,
  } = useCrudForm({
    id,
    fetchFn,
    createFn,
    updateFn,
    defaults,
    transformIn,
    transformOut,
    extraParams,
  });

  const fieldValidators = getValidators ? getValidators(formConfig) : {};

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {JSON.stringify(error)}</p>;

  return (
    <form onSubmit={(e) => handleSubmit(e, fieldValidators)}>
      <FormRenderer
        formConfig={formConfig}
        layoutConfig={layoutConfig}
        formState={formState}
        onFieldChange={handleChange}
        errors={errors}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
