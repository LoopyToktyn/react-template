import { Button, Typography } from "@mui/material";
import FormRenderer from "./FormRenderer";
import { Table, TableColumn } from "@root/components/Table copy";
import { useSearchForm } from "@hooks/useSearchForm copy"; // (the new version)

export interface SearchFormProps<
  TApi extends Record<string, any>,
  TForm,
  TResult extends object
> {
  defaults: TApi;
  searchFn: (
    criteria: TApi | TForm,
    options: {
      page: number;
      rowsPerPage: number;
      sortField?: string;
      sortDirection?: "asc" | "desc";
    }
  ) => Promise<{ results: TResult[]; count?: number }>;
  transformIn?: (data: TApi) => TForm;
  formConfig: any;
  layoutConfig?: any;
  tableColumns: TableColumn<TResult>[];
  tableProps?: {
    defaultSortField?: string;
    defaultSortDirection?: "asc" | "desc";
    rowsPerPage?: number;
  };
  onFormStateChange?: (state: any) => void;
  onResultsChange?: (results: TResult[]) => void;
  /** Optional function to get a row ID. By default, we assume each row has `row.id`. */
  idField?: (row: TResult) => string;
}

export function SearchForm<
  TApi extends Record<string, any>,
  TForm,
  TResult extends object
>({
  defaults,
  searchFn,
  transformIn = (data) => data as unknown as TForm,
  formConfig,
  layoutConfig,
  tableColumns,
  tableProps,
  onFormStateChange,
  onResultsChange,
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
    defaults,
    searchFn,
    transformIn,
    onFormStateChange,
    onResultsChange,
    paginationConfig: {
      initialPage: 0,
      rowsPerPage: tableProps?.rowsPerPage || 10,
      defaultSortField: tableProps?.defaultSortField,
      defaultSortDirection: tableProps?.defaultSortDirection,
    },
  });

  const downloadCSV = (csvData: TResult[], filename: string) => {
    if (csvData.length === 0) return;
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
        <Table<TResult>
          columns={tableColumns}
          data={results} // this is already just the page's data from server
          selectable
          onSelectionChange={(selectedRows) => {
            console.log("Selected Rows:", selectedRows);
          }}
          bulkTableActions={[
            { icon: "Delete", onClick: (rows) => rows },
            { icon: "Edit", onClick: (rows) => rows },
            { icon: "Download", onClick: (rows) => rows },
          ]}
          /** Server-side pagination/sorting props */
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
            No results to display. Try searching above!
          </Typography>
        )
      )}
    </form>
  );
}
