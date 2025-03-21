// src/hooks/useSearchForm.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { Axios, AxiosError } from "axios";

export interface UseSearchFormConfig<TApi, TForm, TResult> {
  /** e.g. '/api/users' */
  path: string;
  /** e.g. 'search' or 'list'. Could be used for naming or logging. */
  op?: string;
  /** HTTP method (GET, POST, etc.). Defaults to GET */
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /**
   * Convert server data => initial form state
   */
  transformIn?: (serverData: any) => TForm;
  /**
   * Convert form state => request payload/query parameters.
   * (This is the type TApi, which represents the shape of the request data.)
   */
  transformOut?: (formData: TForm) => TApi;
  /**
   * Convert final server response => the shape you want for your results.
   */
  transformResults?: (rawData: any) => TResult[];

  onFormStateChange?: (state: TForm) => void;
  onResultsChange?: (results: TResult[]) => void;

  /** Pagination & sorting config */
  paginationConfig?: {
    initialPage?: number;
    rowsPerPage?: number;
    defaultSortField?: string;
    defaultSortDirection?: "asc" | "desc";
  };

  /** Optionally pass an initial form state */
  initialFormState?: TForm;
}

export interface UseSearchFormReturn<TForm, TResult> {
  formState: TForm;
  results: TResult[];
  totalCount: number;
  isLoading: boolean;
  error: AxiosError | null;
  handleFieldChange: (fieldName: keyof TForm, value: any) => void;
  handleSearch: () => void;
  handlePageChange: (newPage: number) => void;
  handleRowsPerPageChange: (newRowsPerPage: number) => void;
  handleSortChange: (field: string, direction: "asc" | "desc") => void;
  resetForm: () => void;
  page: number;
  rowsPerPage: number;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}

export function useSearchForm<TApi, TForm extends Record<string, any>, TResult>(
  config: UseSearchFormConfig<TApi, TForm, TResult>
): UseSearchFormReturn<TForm, TResult> {
  const {
    path,
    op = "search",
    method = "GET",
    transformIn,
    transformOut,
    transformResults,
    onFormStateChange,
    onResultsChange,
    paginationConfig,
    initialFormState,
  } = config;

  // Local state for the form, pagination and sorting
  const [formState, setFormState] = useState<TForm>(
    () => initialFormState ?? ({} as TForm)
  );
  const [page, setPage] = useState<number>(paginationConfig?.initialPage ?? 0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(
    paginationConfig?.rowsPerPage ?? 10
  );
  const [sortField, setSortField] = useState<string | undefined>(
    paginationConfig?.defaultSortField
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    paginationConfig?.defaultSortDirection ?? "asc"
  );
  const [shouldSearch, setShouldSearch] = useState(false);

  // Transform the form state into the shape expected by the server (TApi)
  const outputData = useMemo(() => {
    return transformOut ? transformOut(formState) : formState;
  }, [formState, transformOut]);

  // Build a dynamic queryKey that includes op, path, method, and search/pagination/sort parameters.
  const queryKey = useMemo(() => {
    return [
      "search",
      {
        op,
        path,
        method,
        params: {
          ...outputData,
          page,
          rowsPerPage,
          sortField,
          sortDirection,
        },
      },
    ];
  }, [
    op,
    path,
    method,
    outputData,
    page,
    rowsPerPage,
    sortField,
    sortDirection,
  ]);

  // Explicitly type the query options so that keepPreviousData is recognized.
  const queryOptions: any = {
    queryKey,
    enabled: shouldSearch, // only fetch after user triggers search
    keepPreviousData: true, // retain previous results while new data loads
  };

  const { data, isLoading, error, refetch }: UseQueryResult<any, AxiosError> =
    useQuery(queryOptions);

  const [results, setResults] = useState<TResult[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    if (data) {
      // Transform the raw server response into an array of results.
      const shapedResults = transformResults
        ? transformResults(data)
        : data.results ?? data;
      setResults(shapedResults);
      setTotalCount(data.count ?? shapedResults.length);
      if (onResultsChange) {
        onResultsChange(shapedResults);
      }
    }
  }, [data, transformResults, onResultsChange]);

  // Handler to update a specific field in the form state.
  const handleFieldChange = useCallback(
    (fieldName: keyof TForm, value: any) => {
      setFormState((prev) => {
        const updated = { ...prev, [fieldName]: value };
        onFormStateChange?.(updated);
        return updated;
      });
    },
    [onFormStateChange]
  );

  // Trigger a new search (resets the page to 0)
  const handleSearch = useCallback(() => {
    setPage(0);
    setShouldSearch(true);
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      if (shouldSearch) refetch();
    },
    [shouldSearch, refetch]
  );

  const handleRowsPerPageChange = useCallback(
    (newRowsPerPage: number) => {
      setRowsPerPage(newRowsPerPage);
      setPage(0);
      if (shouldSearch) refetch();
    },
    [shouldSearch, refetch]
  );

  // Sorting handler
  const handleSortChange = useCallback(
    (field: string, direction: "asc" | "desc") => {
      setSortField(field);
      setSortDirection(direction);
      setPage(0);
      if (shouldSearch) refetch();
    },
    [shouldSearch, refetch]
  );

  // Reset form and related states.
  const resetForm = useCallback(() => {
    setFormState(initialFormState ?? ({} as TForm));
    setPage(paginationConfig?.initialPage ?? 0);
    setRowsPerPage(paginationConfig?.rowsPerPage ?? 10);
    setSortField(paginationConfig?.defaultSortField);
    setSortDirection(paginationConfig?.defaultSortDirection ?? "asc");
    setShouldSearch(false);
    setResults([]);
  }, [initialFormState, paginationConfig]);

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
    page,
    rowsPerPage,
    sortField,
    sortDirection,
  };
}
