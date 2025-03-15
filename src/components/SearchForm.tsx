// SearchForm.tsx
import React from "react";
import { Button, Typography } from "@mui/material";
import FormRenderer from "./FormRenderer";
import { Table, TableColumn } from "@root/components/Table";
import { useSearchForm } from "@hooks/useSearchForm";

export interface SearchFormProps<T, R extends object> {
  /** The initial search criteria */
  defaults: T;
  /**
   * Function to perform the search.
   * Receives transformed criteria and optional pagination.
   */
  searchFn: (criteria: T, pagination?: any) => Promise<R[]>;
  /**
   * Optional transformation for incoming default values.
   */
  transformIn?: (data: T) => { [key: string]: any };
  /**
   * Optional transformation before sending search criteria.
   */
  transformOut?: (data: { [key: string]: any }) => T;
  /** Form configuration dictionary */
  formConfig: any;
  /** Layout configuration for the form */
  layoutConfig?: any;
  /** Table columns for rendering search results */
  tableColumns: TableColumn<R>[];
  /**
   * Optional table properties (defaultSortField, rowsPerPage, etc.).
   */
  tableProps?: {
    defaultSortField?: string;
    defaultSortDirection?: "asc" | "desc";
    rowsPerPage?: number;
  };
  /** Optional callback to expose form state changes */
  onFormStateChange?: (state: any) => void;
  /** Optional callback to expose search results changes */
  onResultsChange?: (results: R[]) => void;
  /**
   * Optional configuration to determine a unique identifier for a row.
   * Can be a function that returns a composite key.
   */
  idField?: (row: R) => string;
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
  onFormStateChange,
  onResultsChange,
  idField,
}: SearchFormProps<T, R>) {
  const {
    formState,
    results,
    isLoading,
    error,
    handleFieldChange,
    handleSearch,
    resetForm,
    pagination,
    setPage,
    setRowsPerPage,
  } = useSearchForm<T, R>({
    defaults,
    searchFn,
    transformIn,
    transformOut,
    onFormStateChange,
    onResultsChange,
    paginationConfig: {
      initialPage: 1,
      rowsPerPage: tableProps?.rowsPerPage || 10,
    },
  });

  // CSV export functionality
  const downloadCSV = (csvData: any[], filename: string) => {
    const csvRows = [];
    if (csvData.length === 0) return;
    // Extract headers from the first row
    const headers = Object.keys(csvData[0]);
    csvRows.push(headers.join(","));
    csvData.forEach((row) => {
      const values = headers.map((header) =>
        JSON.stringify(row[header], replacer)
      );
      csvRows.push(values.join(","));
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Helper to replace null values with empty strings
  const replacer = (key: string, value: any) => (value === null ? "" : value);

  const handleExportCSV = () => {
    if (results && results.length > 0) {
      // Export all fields by default.
      const csvData = results.map((row: any) => ({ ...row }));
      downloadCSV(csvData, "search_results.csv");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
    >
      <FormRenderer
        formConfig={formConfig}
        layoutConfig={layoutConfig}
        formState={formState}
        onFieldChange={handleFieldChange}
      />
      <div style={{ marginTop: "16px" }}>
        <Button type="submit" variant="contained">
          Search
        </Button>
        <Button variant="outlined" onClick={resetForm} sx={{ ml: 2 }}>
          Reset
        </Button>
        <Button variant="outlined" onClick={handleExportCSV} sx={{ ml: 2 }}>
          Export CSV
        </Button>
      </div>
      {isLoading && <Typography variant="body2">Loading...</Typography>}
      {error && (
        <Typography variant="body2" color="error">
          Error: {JSON.stringify(error)}
        </Typography>
      )}
      {results && results.length > 0 ? (
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
          // Use the idField if provided to compute a unique key per row.
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
      {/* Basic pagination controls */}
      {results && results.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <Button
            onClick={() => setPage((pagination.page || 1) - 1)}
            disabled={(pagination.page || 1) === 1}
          >
            Previous
          </Button>
          <Typography variant="body2" component="span" sx={{ mx: 2 }}>
            Page {pagination.page}
          </Typography>
          <Button onClick={() => setPage((pagination.page || 1) + 1)}>
            Next
          </Button>
          <Button
            onClick={() => setRowsPerPage((tableProps?.rowsPerPage || 10) + 10)}
            sx={{ ml: 2 }}
          >
            Increase Rows Per Page
          </Button>
        </div>
      )}
    </form>
  );
}
