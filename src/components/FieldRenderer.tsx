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
import ListField from "./ListField";
import { FormConfigDictionary } from "@components/FormRenderer";

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

export interface FieldConfigFn {
  fs: any;
  val: any;
  field: FieldConfig;
  formConfig: FormConfigDictionary;
}

export interface FieldConfig {
  name: string | ((params: FieldConfigFn) => string);
  label?: string | ((params: FieldConfigFn) => string);
  type: FieldType | ((params: FieldConfigFn) => FieldType);
  columns?:
    | ColumnDefinition[]
    | ((params: FieldConfigFn) => ColumnDefinition[]);
  options?: Option[] | ((params: FieldConfigFn) => Option[]);
  fullWidth?: boolean | ((params: FieldConfigFn) => boolean);
  disabled?: boolean | ((params: FieldConfigFn) => boolean);
  readOnly?: boolean | ((params: FieldConfigFn) => boolean);
  required?: boolean | ((params: FieldConfigFn) => boolean);
  validation?: (fs: any, fieldValue: any) => string | null;
  customRender?: (params: {
    value: any;
    onChange: (newValue: any) => void;
    error?: string | null;
    field: FieldConfig;
    formState: any;
    formConfig: FormConfigDictionary;
    path: string;
    localErrors: Record<string, string>;
    parentErrors: Record<string, string>;
  }) => React.ReactNode;

  visible?:
    | boolean
    | ((params: FieldConfigFn) => boolean | [boolean, boolean])
    | [boolean, boolean];
  sx?: object | ((params: FieldConfigFn) => object);
  dynamicDependencies?: string[];
}

export interface FieldRendererProps {
  field?: FieldConfig;
  formState: any;
  formConfig: FormConfigDictionary;
  onFieldChange: (fieldPath: string, newState: any) => void;
  parentErrors: Record<string, string>;
  localErrors: Record<string, string>;
  setLocalErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

function getNestedValue(obj: any, path: string): any {
  return path
    .split(".")
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function setNestedValue(obj: any, path: string, value: any): any {
  const keys = path.split(".");
  const updated = { ...obj };
  let current = updated;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (typeof current[k] !== "object" || current[k] == null) {
      current[k] = {};
    } else {
      // Shallow copy so we don't mutate existing references
      current[k] = { ...current[k] };
    }
    current = current[k];
  }
  current[keys[keys.length - 1]] = value;
  return updated;
}

// Helper to safely evaluate a dynamic field that can be either a literal or a function.
// We'll pass in { fs, val, field, formConfig }, and let the function read from there.
function evaluateDynamic<T>(
  raw: T | ((args: FieldConfigFn) => T),
  param: FieldConfigFn
): T {
  if (typeof raw === "function") {
    // raw is a function that takes the param object
    return (raw as any)(param);
  }
  return raw as T;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  formState,
  formConfig,
  onFieldChange,
  parentErrors,
  localErrors,
  setLocalErrors,
}) => {
  if (!field) return null;

  // Combine dynamicDependencies + the field's "name" if it's a static string
  const baseDeps = Array.isArray(field.dynamicDependencies)
    ? field.dynamicDependencies
    : [];
  const nameIsString = typeof field.name === "string" ? field.name : null;
  const finalDepPaths =
    nameIsString && !baseDeps.includes(nameIsString)
      ? [...baseDeps, nameIsString]
      : baseDeps;

  // Convert each dependency path to its current value in formState
  const depValues = finalDepPaths.map((depPath) =>
    getNestedValue(formState, depPath)
  );

  /**
   * Single useMemo to compute:
   *  1) name
   *  2) value from formState
   *  3) paramObj = { fs: formState, val, field, formConfig }
   *  4) label, type, disabled, required, etc., all referencing paramObj
   *  5) isVisible, reserveSpace
   */
  const {
    evalName,
    value,
    evalLabel,
    evalType,
    evalFullWidth,
    evalDisabled,
    evalReadOnly,
    evalRequired,
    evalOptions,
    evalColumns,
    evalSx,
    isVisible,
    reserveSpace,
  } = useMemo(() => {
    // First evaluate name with a param object that doesn't rely on "val", since we can't read the value if we don't know the final name yet.
    const tempParamForName = {
      fs: formState,
      val: undefined,
      field,
      formConfig,
    };
    const rawName = evaluateDynamic(field.name, tempParamForName);

    // Then read the real value from the computed name
    const rawVal = getNestedValue(formState, rawName);

    // Param object for everything else (label, type, etc.)
    const paramObj = {
      fs: formState,
      val: rawVal,
      field,
      formConfig,
    };

    // Evaluate the rest
    const label =
      field.label !== undefined
        ? evaluateDynamic(field.label, paramObj)
        : undefined;
    const type = evaluateDynamic(field.type, paramObj);
    const fullWidth =
      field.fullWidth !== undefined
        ? evaluateDynamic(field.fullWidth, paramObj)
        : true;
    const disabled = field.disabled
      ? evaluateDynamic(field.disabled, paramObj)
      : false;
    const readOnly = field.readOnly
      ? evaluateDynamic(field.readOnly, paramObj)
      : false;
    const required = field.required
      ? evaluateDynamic(field.required, paramObj)
      : false;
    const options = field.options
      ? evaluateDynamic(field.options, paramObj)
      : undefined;
    const columns = field.columns
      ? evaluateDynamic(field.columns, paramObj)
      : undefined;
    const sx = field.sx ? evaluateDynamic(field.sx, paramObj) : {};

    // Visibility
    let visible = true;
    let reserve = false;
    if (field.visible !== undefined) {
      const visRaw = evaluateDynamic(field.visible, paramObj);
      if (Array.isArray(visRaw)) {
        [visible, reserve] = visRaw;
      } else {
        visible = !!visRaw;
      }
    }

    // For "checkbox" and "list" we want value to be array/boolean by default
    let finalValue = rawVal ?? "";
    if (type === "multiselect" || type === "list") {
      finalValue = Array.isArray(rawVal) ? rawVal : [];
    } else if (type === "checkbox") {
      finalValue = typeof rawVal === "boolean" ? rawVal : false;
    }

    return {
      evalName: rawName,
      value: finalValue,
      evalLabel: label,
      evalType: type,
      evalFullWidth: fullWidth,
      evalDisabled: disabled,
      evalReadOnly: readOnly,
      evalRequired: required,
      evalOptions: options,
      evalColumns: columns,
      evalSx: sx,
      isVisible: visible,
      reserveSpace: reserve,
    };
  }, [formState, formConfig, field, ...depValues]);

  // Combine local + parent errors, local takes precedence
  const errorMsg = localErrors[evalName] || parentErrors[evalName] || "";

  // Wrapper for nested writes
  const handleChange = (newVal: any) => {
    const updated = setNestedValue(formState, evalName, newVal);
    onFieldChange(evalName, updated);
  };

  // Validate on blur
  const handleBlur = () => {
    if (field.validation) {
      const err = field.validation(formState, value);
      setLocalErrors((prev) => ({ ...prev, [evalName]: err || "" }));
    }
  };

  // If not visible, optionally reserve space
  if (!isVisible && !reserveSpace) return null;
  if (!isVisible && reserveSpace) {
    return <Box sx={{ minHeight: 56 }} />;
  }

  // If there's a customRender, let it take over
  if (field.customRender) {
    return (
      <>
        {field.customRender({
          value,
          onChange: handleChange,
          error: errorMsg || null,
          field,
          formState,
          formConfig,
          path: evalName,
          localErrors,
          parentErrors,
        }) ?? null}
      </>
    );
  }

  // For standard MUI field types...
  const commonProps = {
    name: evalName,
    label: evalLabel,
    value,
    fullWidth: evalFullWidth,
    disabled: evalDisabled,
    required: evalRequired,
    error: Boolean(errorMsg),
    helperText: errorMsg,
    InputProps: { readOnly: evalReadOnly },
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      handleChange(e.target.value),
    onBlur: handleBlur,
    sx: {
      "& .MuiInputLabel-shrink": {
        zIndex: 10000,
        backgroundColor: (theme: any) => theme.palette.background.default,
        marginTop: "5px",
        paddingX: "4px",
      },
      "& .MuiOutlinedInput-notchedOutline legend": {
        marginLeft: "4px",
      },
      ...evalSx,
    },
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
              sx={commonProps.sx}
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
        <FormControl fullWidth error={Boolean(errorMsg)} sx={commonProps.sx}>
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
        <FormControl fullWidth error={Boolean(errorMsg)} sx={commonProps.sx}>
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
      // "composite" or unrecognized
      return null;
  }
};
