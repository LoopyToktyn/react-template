// src/components/SearchForm.tsx
import { Button, Typography } from "@mui/material";
import FormRenderer from "./FormRenderer";
import { Table, TableColumn } from "@root/components/Table";
import { useSearchForm, UseSearchFormConfig } from "@hooks/useSearchForm";

export interface SearchFormProps<TForm, TResult extends object> {
  /** The config for the search hook (now only has searchFn + pagination stuff). */
  config: UseSearchFormConfig<TForm, TResult>;

  /** Configuration for rendering the form fields (unchanged). */
  formConfig: any;
  layoutConfig?: any;

  /** Table columns and optional table props. */
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
  TForm extends Record<string, any>,
  TResult extends object
>({
  config,
  formConfig,
  layoutConfig,
  tableColumns,
  tableProps,
}: SearchFormProps<TForm, TResult>) {
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
  } = useSearchForm<TForm, TResult>({
    // Spread your config in, which includes searchFn, initialValues, etc.
    ...config,
    // If your page or table props want to override any default pagination settings, do so below:
    initialPage: config.initialPage ?? 0,
    rowsPerPage: tableProps?.rowsPerPage ?? 10,
    defaultSortField: tableProps?.defaultSortField ?? config.defaultSortField,
    defaultSortDirection:
      tableProps?.defaultSortDirection ?? config.defaultSortDirection,
  });

  // An optional CSV downloader (unchanged)
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

      {error && (
        <Typography variant="body2" color="error">
          Error: {JSON.stringify(error)}
        </Typography>
      )}

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
    </form>
  );
}
