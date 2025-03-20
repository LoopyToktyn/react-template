// src/ExamplePage.tsx

import React from "react";
import { Container, Typography, Button } from "@mui/material";
import { useCrudForm } from "@root/hooks/useCrudForm copy";
import FormRenderer from "@components/FormRenderer";
import {
  FormConfigDictionary,
  LayoutConfig,
  ApiRequest,
  ApiResponse,
  FormShape,
} from "@root/types";

// ---------------------
// Example API Type Definitions for this page
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

// ---------------------
// API Transformation Functions
const transformIn = (apiData: any) => ({
  ...apiData,
  customData: apiData.customData || { option: "", checked: false },
});

const transformOut = (formData: any) => ({
  ...formData,
});

// ---------------------
// Form Configuration
const formConfig: FormConfigDictionary = {
  name: { name: "name", label: "Name", type: "text", required: true },
  email: { name: "email", label: "Email", type: "text", required: true },
  description: { name: "description", label: "Description", type: "textarea" },
  gender: {
    name: "gender",
    label: "Gender",
    type: "radio",
    options: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
    ],
  },
  subscribe: { name: "subscribe", label: "Subscribe", type: "checkbox" },
  country: {
    name: "country",
    label: "Country",
    type: "select",
    options: [
      { label: "USA", value: "usa" },
      { label: "Canada", value: "canada" },
    ],
  },
  skills: {
    name: "skills",
    label: "Skills",
    type: "multiselect",
    options: [
      { label: "JavaScript", value: "javascript" },
      { label: "React", value: "react" },
      { label: "TypeScript", value: "typescript" },
    ],
  },

  addresses: {
    name: "addresses",
    label: "Addresses",
    type: "list",
    columns: [
      { key: "street", label: "Street" },
      { key: "city", label: "City" },
      { key: "zip", label: "ZIP Code" },
    ],
  },
  customData: {
    name: "customData",
    label: "Custom Field",
    type: "composite",
    customRender: (value, onChange, error) => (
      <div>
        <Typography variant="subtitle1">Custom Field</Typography>
        <input
          type="text"
          value={value.option}
          onChange={(e) => onChange({ ...value, option: e.target.value })}
        />
        <input
          type="checkbox"
          checked={value.checked}
          onChange={(e) => onChange({ ...value, checked: e.target.checked })}
        />
      </div>
    ),
  },
};

// ---------------------
// Layout Configuration
const exampleLayout: LayoutConfig = {
  rows: [
    { columns: [{ fields: ["name", "email"], gridProps: { xs: 12, sm: 6 } }] },
    {
      columns: [
        { fields: ["gender", "subscribe"], gridProps: { xs: 12, sm: 6 } },
      ],
    },
    { columns: [{ fields: ["description"], gridProps: { xs: 12 } }] },
    {
      columns: [
        { fields: ["country", "skills"], gridProps: { xs: 12, sm: 6 } },
      ],
    },
    { columns: [{ fields: ["customData"], gridProps: { xs: 12 } }] },
  ],
};

// ---------------------
// Example Page Component
export default function ExamplePage() {
  const { formData, setFormData, isLoading, update } = useCrudForm<
    UserApiRequest,
    UserApiResponse,
    UserFormShape
  >({
    id: "1",
    fetchConfig: { path: "/users/{id}", op: "GET" },
    updateConfig: { path: "/users/{id}", op: "PUT" },
    defaults: { name: "", email: "", description: "" },
    transformIn,
    transformOut,
  });

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Example Form with Dynamic Rendering
      </Typography>

      <FormRenderer
        formConfig={formConfig}
        formState={formData}
        onFieldChange={(name, value) =>
          setFormData((prev) => ({ ...prev, [name]: value }))
        }
      />

      <Button
        onClick={() => update(formData)}
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
      >
        Save
      </Button>
    </Container>
  );
}
