import { useState, useCallback } from "react";
import { useQuery, QueryKey } from "@tanstack/react-query";

export interface UseSearchFormConfig<TForm, TResult> {
  /** Initial form values */
  initialValues?: Partial<TForm>;

  /** Starting page (0-based) */
  initialPage?: number;

  /** Rows per page in the table */
  rowsPerPage?: number;

  /** Default sort field & direction for the table */
  defaultSortField?: string;
  defaultSortDirection?: "asc" | "desc";

  /**
   * The function to execute the actual search request.
   * You define it in your service file.
   */
  searchFn: (
    criteria: TForm,
    page: number,
    rowsPerPage: number,
    sortField?: string,
    sortDirection?: "asc" | "desc"
  ) => Promise<{ results: TResult[]; totalCount: number }>;
}

export function useSearchForm<TForm extends Record<string, any>, TResult>(
  config: UseSearchFormConfig<TForm, TResult>
) {
  const {
    initialValues = {},
    initialPage = 0,
    rowsPerPage = 10,
    defaultSortField,
    defaultSortDirection = "asc",
    searchFn,
  } = config;

  /** Live form data the user is editing (no effect on query). */
  const [formState, setFormState] = useState<TForm>(initialValues as TForm);

  /**
   * "Locked-in" search criteria only updates when user hits Search.
   * This is what the query actually uses so we don't refetch on every form change.
   */
  const [searchCriteria, setSearchCriteria] = useState<TForm | null>(null);

  /** Pagination & sorting states. */
  const [page, setPage] = useState(initialPage);
  const [rowsPerPageState, setRowsPerPageState] = useState(rowsPerPage);
  const [sortField, setSortField] = useState<string | undefined>(
    defaultSortField
  );
  const [sortDirection, setSortDirection] = useState<
    "asc" | "desc" | undefined
  >(defaultSortDirection);

  /** Whether the user has submitted at least one search. */
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * The query key references the "locked-in" searchCriteria (not the live formState!),
   * and also references paging/sorting so those changes trigger re-fetches *after* a search has been done.
   */
  const queryKey: QueryKey = [
    "search",
    searchCriteria,
    page,
    rowsPerPageState,
    sortField,
    sortDirection,
  ];

  /**
   * useQuery won't run if `enabled` is false. Because `enabled` depends on both
   * isSubmitted (the user actually clicked search) AND searchCriteria not being null,
   * it won't auto-fetch on page load or form changes.
   */
  const query = useQuery<{ results: TResult[]; totalCount: number }>({
    queryKey,
    queryFn: () =>
      searchCriteria
        ? searchFn(
            searchCriteria,
            page,
            rowsPerPageState,
            sortField,
            sortDirection
          )
        : // If searchCriteria is null, we can return empty results
          Promise.resolve({ results: [], totalCount: 0 }),
    enabled: isSubmitted && searchCriteria !== null,
    // Optional caching config:
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // ---- Handlers ----

  // Update form fields locally, but do not re-run query.
  const handleFieldChange = useCallback(
    (fieldName: keyof TForm, value: any) => {
      setFormState((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    },
    []
  );

  // Lock in the current formState for the query, mark as submitted.
  // The new queryKey triggers a fetch (since enabled => true).
  const handleSearch = useCallback(() => {
    setSearchCriteria(formState);
    setIsSubmitted(true);
  }, [formState]);

  // If you do want to re-fetch whenever user changes page/sort:
  // This will cause the query to re-run if isSubmitted is already true.
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPageState(newRowsPerPage);
    setPage(0);
  }, []);

  const handleSortChange = useCallback(
    (field: string, direction: "asc" | "desc") => {
      setSortField(field);
      setSortDirection(direction);
      setPage(0);
    },
    []
  );

  /**
   * RESET: Clear the form back to initial values, restore
   * page/sort defaults, and set searchCriteria=null (so no results).
   */
  const resetForm = useCallback(() => {
    setFormState(initialValues as TForm);
    setPage(initialPage);
    setRowsPerPageState(rowsPerPage);
    setSortField(defaultSortField);
    setSortDirection(defaultSortDirection);
    setSearchCriteria(null);
    setIsSubmitted(false);
  }, [
    initialValues,
    initialPage,
    rowsPerPage,
    defaultSortField,
    defaultSortDirection,
  ]);

  // isLoading can rely on query.status or isInitialLoading.
  // If the query never runs (enabled=false), status is 'idle' => not loading.
  // If it is fetching, status is 'loading' or 'fetching'.
  // We'll define a combined state:
  const isLoading = query.isInitialLoading || query.isFetching;

  return {
    // Expose the live form state
    formState,
    setFormState,

    // The query data or fallback
    results: query.data?.results ?? [],
    totalCount: query.data?.totalCount ?? 0,

    // Combined loading state
    isLoading,

    // If there's an error, query.error is typed as unknown by default
    // You can cast or narrow if you have a known error shape
    error: query.error,

    // Current page/pagination state
    page,
    rowsPerPage: rowsPerPageState,
    sortField,
    sortDirection,

    // Handlers
    handleFieldChange,
    handleSearch,
    handlePageChange,
    handleRowsPerPageChange,
    handleSortChange,
    resetForm,
  };
}
