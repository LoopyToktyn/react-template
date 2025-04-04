// src/CrudForm/FormRenderer.tsx

import React, { ReactNode } from "react";
import {
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip,
  Box,
  Typography,
  FormLabel,
} from "@mui/material";
import ListField from "@components/ListField";

export interface FormRendererProps {
  formConfig: FormConfigDictionary;
  layoutConfig?: LayoutConfig;
  formState: { [key: string]: any };
  onFieldChange: (name: string, value: any) => void;
  errors?: Record<string, string>;
}

// Supported field types.
export type FieldType =
  | "text"
  | "textarea"
  | "radio"
  | "checkbox"
  | "select"
  | "multiselect"
  | "list"
  | "composite";

// Option for select-like fields or radio groups
export interface Option {
  label: string;
  value: any;
}

// Interface for field configuration.
export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  // For fields like radio, select, multiselect
  columns?: { key: string; label: string }[];
  options?: Option[];
  // Layout options: if using a grid system (e.g., MUI Grid)
  grid?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  fullWidth?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  validation?: (value: any) => string | null;
  // For custom composite fields.
  customRender?: (
    value: any,
    onChange: (value: any) => void,
    error?: string | null
  ) => ReactNode;
}

// Instead of an array, we use a dictionary (keyed by field name).
export type FormConfigDictionary = Record<string, FieldConfig>;

// ----------------------
// Layout Configuration remains similar.
export interface LayoutConfig {
  rows: LayoutRow[];
}

export interface LayoutRow {
  gridProps?: {
    spacing?: number;
    // Other MUI <Grid container> props.
  };
  columns: LayoutColumn[];
}

export interface LayoutColumn {
  // Either an array of field names or a nested layout.
  fields?: string[];
  subLayout?: LayoutConfig;
  gridProps?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    // etc.
  };
}

const FormRenderer: React.FC<FormRendererProps> = ({
  formConfig,
  layoutConfig,
  formState,
  onFieldChange,
  errors = {},
}) => {
  // Direct lookup in the dictionary
  const getFieldConfig = (name: string) => formConfig[name];

  const renderField = (fieldName: string) => {
    const field = getFieldConfig(fieldName);
    if (!field) {
      return (
        <Typography color="error">Missing config for "{fieldName}"</Typography>
      );
    }

    let value = formState[field.name];

    // Ensure type safety for different field types
    switch (field.type) {
      case "multiselect":
        value = Array.isArray(value) ? value : [];
        break;
      case "checkbox":
        value = typeof value === "boolean" ? value : false;
        break;
      case "list":
        value = Array.isArray(value) ? value : [];
        break;
      default:
        value = value ?? ""; // Fallback for text-based inputs
    }

    const errorMsg = errors[field.name] || "";
    const commonProps = {
      name: field.name,
      label: field.label,
      value,
      fullWidth: field.fullWidth ?? true,
      disabled: field.disabled,
      InputProps: { readOnly: field.readOnly },
      required: field.required,
      error: Boolean(errorMsg),
      helperText: errorMsg,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => onFieldChange(field.name, e.target.value),
    };

    switch (field.type) {
      case "text":
        return <TextField {...commonProps} />;
      case "textarea":
        return <TextField {...commonProps} multiline rows={4} />;
      case "checkbox":
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={value}
                onChange={(e) => onFieldChange(field.name, e.target.checked)}
                name={field.name}
                disabled={field.disabled}
              />
            }
            label={field.label}
          />
        );
      case "radio":
        return (
          <FormControl component="fieldset" error={Boolean(errorMsg)}>
            <FormLabel>{field.label}</FormLabel>
            <RadioGroup
              name={field.name}
              value={value}
              onChange={(e) => onFieldChange(field.name, e.target.value)}
            >
              {field.options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                  disabled={field.disabled}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      case "select":
        return (
          <FormControl fullWidth error={Boolean(errorMsg)}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              label={field.label}
              name={field.name}
              value={value}
              onChange={(e) => onFieldChange(field.name, e.target.value)}
              disabled={field.disabled}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "multiselect":
        return (
          <FormControl fullWidth error={Boolean(errorMsg)}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              multiple
              label={field.label}
              name={field.name}
              value={value}
              onChange={(e) => onFieldChange(field.name, e.target.value)}
              input={<OutlinedInput label={field.label} />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as string[]).map((val) => (
                    <Chip key={val} label={val} />
                  ))}
                </Box>
              )}
              disabled={field.disabled}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "list":
        return (
          <ListField
            label={field.label}
            value={value}
            onChange={(newValue) => onFieldChange(field.name, newValue)}
            columns={field.columns} // optional, if you store column config in field.columns
          />
        );
      case "composite":
        return field.customRender ? (
          <div>
            {field.customRender(
              value,
              (val) => onFieldChange(field.name, val),
              errorMsg
            )}
          </div>
        ) : null;
      default:
        return null;
    }
  };

  // Recursive layout renderer
  const renderLayout = (config: LayoutConfig) => {
    return config.rows.map((row, rowIndex) => (
      <Grid
        container
        key={`row-${rowIndex}`}
        // row-level container props
        spacing={row.gridProps?.spacing ?? 2}
        // you can spread row.gridProps as well (just ensure it doesn’t contain item-based props):
        // {...row.gridProps}
      >
        {row.columns.map((col, colIndex) => {
          if (col.subLayout) {
            // Nested layout
            return (
              <Grid item key={`col-${colIndex}`} {...(col.gridProps || {})}>
                {renderLayout(col.subLayout)}
              </Grid>
            );
          } else if (col.fields) {
            // Render fields in this column
            return (
              <Grid item key={`col-${colIndex}`} {...(col.gridProps || {})}>
                {col.fields.map((fieldName) => (
                  <div key={fieldName}>{renderField(fieldName)}</div>
                ))}
              </Grid>
            );
          }
          return null;
        })}
      </Grid>
    ));
  };

  // If no layout config, just display in one column
  if (!layoutConfig) {
    return (
      <Grid container spacing={2}>
        {Object.keys(formConfig).map((fieldName) => (
          <Grid item xs={12} key={fieldName}>
            {renderField(fieldName)}
          </Grid>
        ))}
      </Grid>
    );
  }

  // Otherwise, render the specified layout
  return <>{renderLayout(layoutConfig)}</>;
};

export default FormRenderer;
