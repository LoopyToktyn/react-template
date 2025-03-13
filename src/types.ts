// src/types.ts

import { ReactNode } from "react";

// Base types.
export interface ApiRequest {
  [key: string]: any;
}

export interface ApiResponse {
  [key: string]: any;
}

export interface FormShape {
  [key: string]: any;
}

// ----------------------
// Extended interfaces for our example “User” model:

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

// ----------------------
// Field Configuration Types

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

// MENU TYPES
export interface MenuItemConfig {
  label: string;
  path?: string; // only for leaf items
  allowedRoles?: string[];
  subMenu?: MenuItemConfig[];
}

export interface NestedMenuItemProps {
  item: MenuItemConfig;
  roles: string[];
  level?: number;
  closeAllMenus: () => void;
  closeSignal: number;
}
