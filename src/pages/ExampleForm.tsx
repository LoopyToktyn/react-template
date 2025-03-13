// src/ExamplePage.tsx

import React from "react";
import {
  Checkbox,
  Container,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { CrudForm } from "@components/CrudForm";
import {
  UserApiResponse,
  FormConfigDictionary,
  LayoutConfig,
} from "@root/types";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// ---------------------
// Dummy API data and functions using our new types.
const fakeApiResponse = {
  name: "John Doe",
  email: "john@example.com",
  description: "A sample user",
  gender: "male",
  subscribe: true,
  country: "usa",
  skills: ["javascript", "react"],
  addresses: ["123 Main St"],
  customData: { option: "A", checked: true },
};

const fetchUser = async (id: string): Promise<UserApiResponse> => {
  return new Promise((resolve) =>
    setTimeout(() => resolve(fakeApiResponse), 500)
  );
};

const createUser = async (data: any): Promise<UserApiResponse> => {
  console.log("Creating user with data:", data);
  return new Promise((resolve) => setTimeout(() => resolve(data), 500));
};

const updateUser = async (id: string, data: any): Promise<UserApiResponse> => {
  console.log("Updating user with id", id, "and data:", data);
  return new Promise((resolve) => setTimeout(() => resolve(data), 500));
};

// Transformation functions.
const transformIn = (apiData: any) => {
  return {
    ...apiData,
    customData: apiData.customData || { option: "", checked: false },
  };
};

const transformOut = (formData: any) => {
  return {
    ...formData,
  };
};

// ---------------------
// Field configuration as a dictionary.
const formConfig: FormConfigDictionary = {
  name: {
    name: "name",
    label: "Name",
    type: "text",
    required: true,
    validation: (value) => (!value ? "Name is required" : null),
  },
  email: {
    name: "email",
    label: "Email",
    type: "text",
    required: true,
    validation: (value) =>
      !value
        ? "Email is required"
        : !/\S+@\S+\.\S+/.test(value)
        ? "Email is invalid"
        : null,
  },
  description: {
    name: "description",
    label: "Description",
    type: "textarea",
  },
  gender: {
    name: "gender",
    label: "Gender",
    type: "radio",
    options: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
    ],
  },
  subscribe: {
    name: "subscribe",
    label: "Subscribe to newsletter",
    type: "checkbox",
  },
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
  },
  customData: {
    name: "customData",
    label: "Custom Composite Field",
    type: "composite",
    customRender: (value, onChange, error) => (
      <div>
        <Typography variant="subtitle1">Composite Field</Typography>
        <TextField
          label="Option"
          value={value.option}
          onChange={(e) => onChange({ ...value, option: e.target.value })}
          error={Boolean(error)}
          helperText={error}
          fullWidth
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={value.checked}
              onChange={(e) =>
                onChange({ ...value, checked: e.target.checked })
              }
            />
          }
          label="Checked"
        />
      </div>
    ),
  },
};

// ---------------------
// Layout configuration.
const exampleLayout: LayoutConfig = {
  rows: [
    {
      // ROW #1
      gridProps: {
        spacing: 2, // Container-level prop for spacing
        // You could also include justifyContent, alignItems, etc.
        // e.g., justifyContent: "space-between"
      },
      columns: [
        {
          // COLUMN #1
          fields: ["name", "email"],
          // item-based props
          gridProps: { xs: 12, sm: 6 },
        },
        {
          // COLUMN #2
          fields: ["gender", "subscribe"],
          gridProps: { xs: 12, sm: 6 },
        },
      ],
    },
    {
      // ROW #2
      gridProps: {
        spacing: 2,
      },
      columns: [
        {
          fields: ["description"],
          gridProps: { xs: 12 },
        },
      ],
    },
    {
      // ROW #3
      gridProps: {
        spacing: 2,
      },
      columns: [
        {
          subLayout: {
            rows: [
              {
                // Nested row
                gridProps: {
                  spacing: 2,
                },
                columns: [
                  { fields: ["country"], gridProps: { xs: 12, sm: 6 } },
                  { fields: ["skills"], gridProps: { xs: 12, sm: 6 } },
                ],
              },
            ],
          },
          gridProps: { xs: 12 },
        },
      ],
    },
  ],
};

const theme = createTheme();

export default function ExamplePage() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontFamily: "Orbitron , sans-serif",
          background: "linear-gradient(90deg, #ff6f61, #1976d2)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        Example Form with Advanced Layout and Dictionary Config
      </Typography>
      <CrudForm
        id="123"
        fetchFn={fetchUser}
        createFn={createUser}
        updateFn={updateUser}
        defaults={fakeApiResponse}
        transformIn={transformIn}
        transformOut={transformOut}
        formConfig={formConfig}
        layoutConfig={exampleLayout}
        // Optional: a function to generate field validators.
        getValidators={(config) => {
          const validators: Record<string, (value: any) => string | null> = {};
          Object.values(config).forEach((field) => {
            if (field.required) {
              validators[field.name] = (value: any) =>
                value === "" || value === undefined || value === null
                  ? `${field.label} is required`
                  : null;
            }
            if (field.validation) {
              validators[field.name] = field.validation;
            }
          });
          return validators;
        }}
      />
    </Container>
  );
}
