// SearchForm.tsx
import React from "react";
import { Button, Typography } from "@mui/material";
import FormRenderer from "./FormRenderer";
import { FormConfigDictionary, LayoutConfig } from "@root/types";
import { Table, TableColumn } from "@root/components/Table";

export interface SearchFormProps<T, R extends object> {
  /** The initial search criteria */
  defaults: T;
  /**
   * Function to perform the search.
   * Receives transformed criteria and returns a promise resolving to results.
   */
  searchFn: (criteria: T) => Promise<R[]>;
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
  /** Form configuration dictionary */
  formConfig: FormConfigDictionary;
  /** Layout configuration for the form */
  layoutConfig?: LayoutConfig;
  /** Table columns for rendering search results */
  tableColumns: TableColumn<R>[];
  /**
   * Optional table properties (e.g. defaultSortField, rowsPerPage).
   */
  tableProps?: {
    defaultSortField?: string;
    defaultSortDirection?: "asc" | "desc";
    rowsPerPage?: number;
  };
}

export function SearchForm<T, R extends object>({
  defaults,
  searchFn,
  transformIn = (data) => data as { [key: string]: any },
  transformOut = (data) => data as T,
  formConfig,
  layoutConfig,
  tableColumns,
  tableProps,
}: SearchFormProps<T, R>) {
  const [formState, setFormState] = React.useState<{ [key: string]: any }>(
    transformIn(defaults)
  );
  const [results, setResults] = React.useState<R[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<any>(null);

  const handleFieldChange = (name: string, value: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const criteria = transformOut(formState);
      const fetchedResults = await searchFn(criteria);
      setResults(fetchedResults);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
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

      {isLoading && <Typography variant="body2">Loading...</Typography>}
      {error && (
        <Typography variant="body2" color="error">
          Error: {JSON.stringify(error)}
        </Typography>
      )}
      {results.length > 0 ? (
        <Table<R>
          columns={tableColumns}
          data={results}
          defaultSortField={tableProps?.defaultSortField}
          defaultSortDirection={tableProps?.defaultSortDirection || "asc"}
          rowsPerPage={tableProps?.rowsPerPage || 10}
          selectable
          onSelectionChange={(selectedRows) => {
            console.log("Selected Rows:", selectedRows);
          }}
          bulkTableActions={[
            { icon: "Delete", onClick: (rows) => rows },
            { icon: "Edit", onClick: (rows) => rows },
            { icon: "Download", onClick: (rows) => rows },
          ]}
        />
      ) : (
        !isLoading && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            No results to display. Try searching above!
          </Typography>
        )
      )}
    </form>
  );
}
