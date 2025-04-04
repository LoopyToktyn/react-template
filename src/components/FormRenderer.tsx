import React, { useState } from "react";
import { Grid } from "@mui/material";
import { FieldConfig, FieldRenderer } from "@components/FieldRenderer"; // Adjust your import paths

export interface FormRendererProps {
  formConfig: FormConfigDictionary;
  layoutConfig?: LayoutConfig;
  formState: { [key: string]: any };
  onFieldChange: (name: string, value: any) => void;
  errors?: Record<string, string>;
}

// Dictionary of all fields by name
export type FormConfigDictionary = Record<string, FieldConfig>;

export interface LayoutConfig {
  rows: LayoutRow[];
}

export interface LayoutRow {
  gridProps?: {
    spacing?: number;
    // Other MUI <Grid container> props
  };
  columns: LayoutColumn[];
}

export interface LayoutColumn {
  // Either an array of field names or a nested layout
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
  /**
   * Local errors state – these come from onBlur validations in FieldRenderer.
   * We keep them in FormRenderer so they persist across re-renders
   * and so we can unify them if we wish.
   */
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  // Helper to retrieve the FieldConfig by name
  const getFieldConfig = (name: string) => formConfig[name];

  // Recursively render rows/columns
  const renderLayout = (config: LayoutConfig) => {
    return config.rows.map((row, rowIndex) => (
      <Grid
        container
        key={`row-${rowIndex}`}
        spacing={row.gridProps?.spacing ?? 2}
      >
        {row.columns.map((col, colIndex) => {
          if (col.subLayout) {
            // Nested sub-layout
            return (
              <Grid item key={`col-${colIndex}`} {...(col.gridProps || {})}>
                {renderLayout(col.subLayout)}
              </Grid>
            );
          } else if (col.fields) {
            // Render each field in this column
            return (
              <Grid item key={`col-${colIndex}`} {...(col.gridProps || {})}>
                {col.fields.map((fieldName) => {
                  const fieldConfig = getFieldConfig(fieldName);
                  return (
                    <FieldRenderer
                      key={fieldName}
                      field={fieldConfig}
                      formState={formState}
                      formConfig={formConfig}
                      onFieldChange={onFieldChange}
                      parentErrors={errors}
                      localErrors={localErrors}
                      setLocalErrors={setLocalErrors}
                    />
                  );
                })}
              </Grid>
            );
          }
          return null;
        })}
      </Grid>
    ));
  };

  if (!layoutConfig) {
    // If no layout config, just render all fields in one column
    return (
      <Grid container spacing={2}>
        {Object.keys(formConfig).map((fieldName) => (
          <Grid item xs={12} key={fieldName}>
            <FieldRenderer
              field={getFieldConfig(fieldName)}
              formState={formState}
              formConfig={formConfig}
              onFieldChange={onFieldChange}
              parentErrors={errors}
              localErrors={localErrors}
              setLocalErrors={setLocalErrors}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  return <>{renderLayout(layoutConfig)}</>;
};

export default FormRenderer;
