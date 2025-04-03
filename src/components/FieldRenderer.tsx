import React, { useMemo } from "react";
import {
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
  FormLabel,
} from "@mui/material";
import ListField from "./ListField"; // or wherever your ListField is

export type FieldType =
  | "text"
  | "textarea"
  | "radio"
  | "checkbox"
  | "select"
  | "multiselect"
  | "list"
  | "composite";

export interface Option {
  label: string;
  value: any;
}

export interface ColumnDefinition {
  key: string;
  label: string;
}

/** Your FieldConfig interface, unchanged except for clarity around dynamicDependencies */
export interface FieldConfig {
  name: string | ((formState: any) => string);
  label?: string | ((formState: any) => string);
  type: FieldType | ((formState: any) => FieldType);
  columns?: ColumnDefinition[] | ((formState: any) => ColumnDefinition[]);
  options?: Option[] | ((formState: any) => Option[]);
  fullWidth?: boolean | ((formState: any) => boolean);
  disabled?: boolean | ((formState: any) => boolean);
  readOnly?: boolean | ((formState: any) => boolean);
  required?: boolean | ((formState: any) => boolean);
  validation?: (formState: any, fieldValue: any) => string | null;
  customRender?: (
    value: any,
    onChange: (value: any) => void,
    error?: string | null
  ) => React.ReactNode;
  visible?:
    | boolean
    | ((formState: any) => boolean | [boolean, boolean])
    | [boolean, boolean];
  sx?: object | ((formState: any) => object);
  /**
   * Dynamic dependencies as an array of dot-notation paths.
   * If undefined, we still want a default safe path array.
   */
  dynamicDependencies?: string[];
}

export interface FieldRendererProps {
  field?: FieldConfig; // Marking as optional for extra safety
  formState: any;
  onFieldChange: (fieldPath: string, newState: any) => void;
  parentErrors: Record<string, string>;
  localErrors: Record<string, string>;
  setLocalErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function getNestedValue(obj: any, path: string): any {
  return path
    .split(".")
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

export function setNestedValue(obj: any, path: string, value: any): any {
  const keys = path.split(".");
  const updated = { ...obj };
  let current = updated;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (typeof current[k] !== "object" || current[k] == null) {
      current[k] = {};
    } else {
      // Shallow copy to avoid mutating existing state
      current[k] = { ...current[k] };
    }
    current = current[k];
  }
  current[keys[keys.length - 1]] = value;
  return updated;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  formState,
  onFieldChange,
  parentErrors,
  localErrors,
  setLocalErrors,
}) => {
  // If no field is passed, safely render nothing
  if (!field) {
    return null;
  }

  /**
   * Build up the list of dependencies:
   * - The user-supplied dynamicDependencies (safe to default to [])
   * - Plus the field's own name if it's a static string and not already in the array.
   */
  const baseDeps = Array.isArray(field.dynamicDependencies)
    ? field.dynamicDependencies
    : [];
  const nameIsString = typeof field.name === "string" ? field.name : null;
  const finalDepPaths =
    nameIsString && !baseDeps.includes(nameIsString)
      ? [...baseDeps, nameIsString]
      : baseDeps;

  // Convert each dot-notation path to its current value
  const deps = useMemo(
    () => finalDepPaths.map((depPath) => getNestedValue(formState, depPath)),
    [formState, ...finalDepPaths]
  );

  // Evaluate dynamic props with useMemo, referencing deps
  const evalName = useMemo(() => {
    return typeof field.name === "function"
      ? field.name(formState)
      : field.name;
  }, deps);

  const evalLabel = useMemo(() => {
    if (!field.label) return undefined;
    return typeof field.label === "function"
      ? field.label(formState)
      : field.label;
  }, deps);

  const evalType = useMemo(() => {
    return typeof field.type === "function"
      ? field.type(formState)
      : field.type;
  }, deps);

  const evalFullWidth = useMemo(() => {
    return typeof field.fullWidth === "function"
      ? field.fullWidth(formState)
      : field.fullWidth;
  }, deps);

  const evalDisabled = useMemo(() => {
    return typeof field.disabled === "function"
      ? field.disabled(formState)
      : field.disabled;
  }, deps);

  const evalReadOnly = useMemo(() => {
    return typeof field.readOnly === "function"
      ? field.readOnly(formState)
      : field.readOnly;
  }, deps);

  const evalRequired = useMemo(() => {
    return typeof field.required === "function"
      ? field.required(formState)
      : field.required;
  }, deps);

  const evalOptions = useMemo(() => {
    return typeof field.options === "function"
      ? field.options(formState)
      : field.options;
  }, deps);

  const evalColumns = useMemo(() => {
    return typeof field.columns === "function"
      ? field.columns(formState)
      : field.columns;
  }, deps);

  const evalSx = useMemo(() => {
    return typeof field.sx === "function" ? field.sx(formState) : field.sx;
  }, deps);

  // Evaluate visibility
  let isVisible = true;
  let reserveSpace = false;
  if (field.visible !== undefined) {
    const result =
      typeof field.visible === "function"
        ? field.visible(formState)
        : field.visible;
    if (Array.isArray(result)) {
      [isVisible, reserveSpace] = result;
    } else {
      isVisible = !!result;
    }
  }

  // Get the current field value
  const value = useMemo(() => {
    const rawVal = getNestedValue(formState, evalName);
    if (evalType === "multiselect" || evalType === "list") {
      return Array.isArray(rawVal) ? rawVal : [];
    }
    if (evalType === "checkbox") {
      return typeof rawVal === "boolean" ? rawVal : false;
    }
    return rawVal ?? "";
  }, [formState, evalName, evalType]);

  // Combine local + parent errors, local takes precedence
  const errorMsg = localErrors[evalName] || parentErrors[evalName] || "";

  // Wrapper for nested writes
  const handleChange = (newVal: any) => {
    const updatedState = setNestedValue(formState, evalName, newVal);
    onFieldChange(evalName, updatedState);
  };

  // Validate on blur
  const handleBlur = () => {
    if (field.validation) {
      const err = field.validation(formState, value);
      setLocalErrors((prev) => ({ ...prev, [evalName]: err || "" }));
    }
  };

  // If not visible, optionally reserve space
  if (!isVisible && !reserveSpace) {
    return null;
  }
  if (!isVisible && reserveSpace) {
    return <Box sx={{ minHeight: 56 }} />;
  }

  // If there's a customRender, let it take over
  if (field.customRender) {
    return (
      <>{field.customRender(value, handleChange, errorMsg || null) ?? null}</>
    );
  }

  // For standard MUI field types...
  const commonProps = {
    name: evalName,
    label: evalLabel,
    value,
    fullWidth: evalFullWidth ?? true,
    disabled: evalDisabled,
    InputProps: { readOnly: evalReadOnly },
    required: evalRequired,
    error: Boolean(errorMsg),
    helperText: errorMsg,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      handleChange(e.target.value),
    onBlur: handleBlur,
    sx: evalSx,
  };

  switch (evalType) {
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
              onChange={(e) => handleChange(e.target.checked)}
              onBlur={handleBlur}
              name={evalName}
              disabled={evalDisabled}
              sx={evalSx}
            />
          }
          label={evalLabel}
        />
      );

    case "radio":
      return (
        <FormControl component="fieldset" error={Boolean(errorMsg)} sx={evalSx}>
          {evalLabel && <FormLabel>{evalLabel}</FormLabel>}
          <RadioGroup
            name={evalName}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
          >
            {evalOptions?.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
                disabled={evalDisabled}
              />
            ))}
          </RadioGroup>
        </FormControl>
      );

    case "select":
      return (
        <FormControl fullWidth error={Boolean(errorMsg)} sx={evalSx}>
          {evalLabel && <InputLabel>{evalLabel}</InputLabel>}
          <Select
            label={evalLabel}
            name={evalName}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            disabled={evalDisabled}
          >
            {evalOptions?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );

    case "multiselect":
      return (
        <FormControl fullWidth error={Boolean(errorMsg)} sx={evalSx}>
          {evalLabel && <InputLabel>{evalLabel}</InputLabel>}
          <Select
            multiple
            label={evalLabel}
            name={evalName}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            input={<OutlinedInput label={evalLabel} />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {(selected as string[]).map((val) => (
                  <Chip key={val} label={val} />
                ))}
              </Box>
            )}
            disabled={evalDisabled}
          >
            {evalOptions?.map((option) => (
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
          label={evalLabel || ""}
          value={value}
          onChange={(newValue) => handleChange(newValue)}
          columns={evalColumns}
        />
      );

    default:
      // "composite" or unrecognized type
      return null;
  }
};
