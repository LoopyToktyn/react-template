// useSearchForm.ts
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

export interface Pagination {
  limit: number;
  offset: number;
  page: number;
  count?: number;
}

export interface PaginationConfig {
  initialPage?: number;
  rowsPerPage?: number;
}

export interface UseSearchFormOptions<T, R> {
  defaults: T;
  /**
   * searchFn should accept the search criteria (after transformOut is applied)
   * along with an optional pagination object.
   */
  searchFn: (criteria: T, pagination?: Pagination) => Promise<R[]>;
  transformIn?: (data: T) => any;
  transformOut?: (data: any) => T;
  onFormStateChange?: (state: any) => void;
  onResultsChange?: (results: R[]) => void;
  paginationConfig?: PaginationConfig;
}

export function useSearchForm<T, R>(options: UseSearchFormOptions<T, R>) {
  const {
    defaults,
    searchFn,
    transformIn = (data: T) => data,
    transformOut = (data: any) => data as T,
    onFormStateChange,
    onResultsChange,
    paginationConfig = { initialPage: 1, rowsPerPage: 10 },
  } = options;

  const initialPage = paginationConfig.initialPage || 1;
  const rowsPerPage = paginationConfig.rowsPerPage || 10;

  const [formState, setFormState] = useState<any>(transformIn(defaults));
  const [pagination, setPagination] = useState<Pagination>({
    page: initialPage,
    limit: rowsPerPage,
    offset: (initialPage - 1) * rowsPerPage,
  });

  const handleFieldChange = (name: string, value: any) => {
    const newState = { ...formState, [name]: value };
    setFormState(newState);
    if (onFormStateChange) {
      onFormStateChange(newState);
    }
  };

  const resetForm = () => {
    const initial = transformIn(defaults);
    setFormState(initial);
    setPagination({
      page: initialPage,
      limit: rowsPerPage,
      offset: 0,
    });
  };

  // Use React Query to handle the search API call.
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ["searchResults", formState, pagination],
    queryFn: () => searchFn(transformIn(formState), pagination),
    staleTime: 60_000,
    enabled: false,
  });

  const handleSearch = () => {
    refetch();
  };

  const setPage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
      offset: (page - 1) * prev.limit,
    }));
    refetch();
  };

  const setRowsPerPage = (rows: number) => {
    setPagination({
      page: 1,
      limit: rows,
      offset: 0,
    });
    refetch();
  };

  return {
    formState,
    results: data || [],
    isLoading: isFetching,
    error,
    handleFieldChange,
    handleSearch,
    resetForm,
    pagination,
    setPage,
    setRowsPerPage,
    refetch,
  };
}
