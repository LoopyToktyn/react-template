// SearchForm.tsx
import React from "react";
import { Button } from "@mui/material";
import FormRenderer from "./FormRenderer";
import { FormConfigDictionary, LayoutConfig } from "@root/types";

export interface SearchFormProps<T> {
  /** The initial search criteria */
  defaults: T;
  /**
   * Optional transformation to apply to the defaults.
   * (Defaults to the identity function.)
   */
  transformIn?: (data: T) => { [key: string]: any };
  /**
   * Optional transformation applied before triggering search.
   * (Defaults to the identity function.)
   */
  transformOut?: (data: { [key: string]: any }) => T;
  formConfig: FormConfigDictionary;
  layoutConfig?: LayoutConfig;
  /** Callback when search is submitted; receives the (transformed) criteria */
  onSearch: (criteria: T) => void;
}

export function SearchForm<T>({
  defaults,
  transformIn = (data) => data as { [key: string]: any },
  transformOut = (data) => data as T,
  formConfig,
  layoutConfig,
  onSearch,
}: SearchFormProps<T>) {
  const [formState, setFormState] = React.useState<{ [key: string]: any }>(
    transformIn(defaults)
  );

  const handleFieldChange = (name: string, value: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const criteria = transformOut(formState);
    onSearch(criteria);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormRenderer
        formConfig={formConfig}
        layoutConfig={layoutConfig}
        formState={formState}
        onFieldChange={handleFieldChange}
      />
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Search
      </Button>
    </form>
  );
}
