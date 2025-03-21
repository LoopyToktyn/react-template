import { useState, useEffect } from "react";

export interface UseSearchFormOptions<TApi, TForm, TResult> {
  /** Initial/default API search params (this is your "defaults"). */
  defaults: TApi;

  /** The async function to call that fetches data from the server. */
  searchFn: (
    criteria: TApi | TForm,
    options: {
      page: number;
      rowsPerPage: number;
      sortField?: string;
      sortDirection?: "asc" | "desc";
    }
  ) => Promise<{
    results: TResult[];
    count?: number;
  }>;

  /** Transform data from TApi shape to TForm shape (optional). */
  transformIn?: (data: TApi) => TForm;

  /** Called whenever the formState changes (optional). */
  onFormStateChange?: (state: TForm | TApi) => void;

  /** Called whenever new results are fetched (optional). */
  onResultsChange?: (results: TResult[]) => void;

  /** Initial pagination / sorting config. */
  paginationConfig?: {
    initialPage?: number;
    rowsPerPage?: number;
    defaultSortField?: string;
    defaultSortDirection?: "asc" | "desc";
  };
}

export function useSearchForm<
  TApi extends Record<string, any>,
  TForm,
  TResult
>({
  defaults,
  searchFn,
  transformIn = (data) => data as unknown as TForm,
  onFormStateChange,
  onResultsChange,
  paginationConfig,
}: UseSearchFormOptions<TApi, TForm, TResult>) {
  const [formState, setFormState] = useState<TForm>(() =>
    transformIn(defaults)
  );
  const [results, setResults] = useState<TResult[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const [page, setPage] = useState(paginationConfig?.initialPage ?? 0);
  const [rowsPerPage, setRowsPerPage] = useState(
    paginationConfig?.rowsPerPage ?? 10
  );
  const [sortField, setSortField] = useState<string | undefined>(
    paginationConfig?.defaultSortField
  );
  const [sortDirection, setSortDirection] = useState<
    "asc" | "desc" | undefined
  >(paginationConfig?.defaultSortDirection);

  /** Update form state fields (triggered from <FormRenderer> or manually). */
  const handleFieldChange = (fieldName: string, value: any) => {
    setFormState((prev) => {
      const newState = { ...prev, [fieldName]: value };
      onFormStateChange?.(newState);
      return newState;
    });
  };

  /** Reset form to defaults and results to empty. */
  const resetForm = () => {
    const newState = transformIn(defaults);
    setFormState(newState);
    setResults([]);
    setError(null);
    setPage(0);
    setSortField(paginationConfig?.defaultSortField);
    setSortDirection(paginationConfig?.defaultSortDirection);
    onFormStateChange?.(newState);
  };

  /** Fetch the data from the server using the current formState + pagination/sorting. */
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { results, count } = await searchFn(formState, {
        page,
        rowsPerPage,
        sortField,
        sortDirection,
      });
      setResults(results || []);
      setTotalCount(count ?? 0);
      onResultsChange?.(results || []);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  /** Trigger a search (on "Search" button click or whenever you want). */
  const handleSearch = () => {
    setPage(0); // Usually want to reset to first page on new search
    fetchData();
  };

  /** Expose separate handlers for pagination/sorting changes coming from the Table. */
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleSortChange = (field: string) => {
    if (sortField !== field) {
      // If we change the field, reset to asc
      setSortField(field);
      setSortDirection("asc");
    } else {
      // Cycle asc -> desc -> undefined -> asc
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") setSortDirection(undefined);
      else setSortDirection("asc");
    }
    setPage(0);
  };

  /**
   * Whenever page, rowsPerPage, sortField, or sortDirection changes, fetch new data.
   * Optionally, you could also watch formState changes here if you want "live" searching.
   */
  useEffect(() => {
    // Only fetch if we already have triggered an initial search before
    // (You might want a "didMount" or "autoSearch" param to control this.)
    if (results.length > 0 || page !== 0) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, sortField, sortDirection]);

  return {
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
    // Expose pagination/sorting if needed by the parent
    page,
    rowsPerPage,
    sortField,
    sortDirection,
  };
}
