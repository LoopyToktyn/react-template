// src/components/SearchForm.tsx

import { Button, Typography } from "@mui/material";
import FormRenderer from "./FormRenderer";
import { Table, TableColumn } from "@root/components/Table copy";
import { useSearchForm, UseSearchFormConfig } from "@hooks/useSearchForm copy";

export interface SearchFormProps<TApi, TForm, TResult extends object> {
  /** Configuration for the search hook (includes path, HTTP method, transforms, etc.) */
  config: UseSearchFormConfig<TApi, TForm, TResult>;
  /** Configuration for rendering the form fields */
  formConfig: any;
  layoutConfig?: any;
  /** Table columns and optional table props */
  tableColumns: TableColumn<TResult>[];
  tableProps?: {
    defaultSortField?: string;
    defaultSortDirection?: "asc" | "desc";
    rowsPerPage?: number;
  };
  /** Optional function to get a row ID; defaults to row.id */
  idField?: (row: TResult) => string;
}

export function SearchForm<
  TApi,
  TForm extends Record<string, any>,
  TResult extends object
>({
  config,
  formConfig,
  layoutConfig,
  tableColumns,
  tableProps,
}: SearchFormProps<TApi, TForm, TResult>) {
  const {
    formState,
    results,
    totalCount,
    isLoading,
    error,
    handleFieldChange,
    handleSearch,
    handlePageChange,
    handleRowsPerPageChange,
    handleSortChange,
    resetForm,
    page,
    rowsPerPage,
    sortField,
    sortDirection,
  } = useSearchForm<TApi, TForm, TResult>({
    ...config,
    paginationConfig: {
      initialPage: 0,
      rowsPerPage: tableProps?.rowsPerPage || 10,
      defaultSortField: tableProps?.defaultSortField,
      defaultSortDirection: tableProps?.defaultSortDirection,
      ...config.paginationConfig,
    },
  });

  const downloadCSV = (csvData: TResult[], filename: string) => {
    if (!csvData || csvData.length === 0) return;
    const csvRows: string[] = [];
    const headers = Object.keys(csvData[0]);
    csvRows.push(headers.join(","));
    csvData.forEach((row) => {
      const values = headers.map((header) =>
        JSON.stringify((row as any)[header] ?? "")
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

  const handleExportCSV = () => {
    if (results && results.length > 0) {
      downloadCSV(results, "search_results.csv");
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
        formState={formState as Record<string, any>}
        onFieldChange={(fieldName, value) =>
          handleFieldChange(fieldName as keyof typeof formState, value)
        }
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

      {/* {error && (
        <Typography variant="body2" color="error">
          Error: {JSON.stringify(error)}
        </Typography>
      )} */}

      {results && results.length > 0 ? (
        <Table<TResult>
          columns={tableColumns}
          data={results}
          selectable
          onSelectionChange={(selectedRows) => {
            console.log("Selected Rows:", selectedRows);
          }}
          bulkTableActions={[
            { icon: "Delete", onClick: (rows) => rows },
            { icon: "Edit", onClick: (rows) => rows },
            { icon: "Download", onClick: (rows) => rows },
          ]}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalCount}
          sortField={sortField}
          sortDirection={sortDirection}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onSortChange={handleSortChange}
        />
      ) : (
        !isLoading && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            No results to display.
          </Typography>
        )
      )}
    </form>
  );
}
