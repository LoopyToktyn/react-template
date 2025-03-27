// src/api/peopleService.ts
import axios from "axios";

/**
 * Example search criteria from your form
 * (the shape your React form uses).
 */
export interface SearchCriteria {
  textQuery?: string;
  showActive?: boolean;
  category?: string;
  sortOrder?: string;
  // Add other fields as needed
}

/**
 * Parameters the API actually accepts.
 * transformSearch() will convert your form inputs to this shape.
 */
export interface PeopleSearchParams {
  searchText?: string;
  onlyActive?: boolean;
  category?: string;
  sortOrder?: string;
  // Add other fields if your backend expects them
}

/**
 * The shape of each person record returned by the API.
 */
export interface PersonRecord {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
}

/**
 * Convert your form's SearchCriteria into the PeopleSearchParams
 * that your backend expects.
 */
function transformSearch(form: SearchCriteria): PeopleSearchParams {
  return {
    searchText: form.textQuery,
    onlyActive: form.showActive,
    category: form.category,
    sortOrder: form.sortOrder,
  };
}

/**
 * Convert raw API response data into the final array
 * of PersonRecord objects.
 */
function transformResults(rawData: any[]): PersonRecord[] {
  // If the API returns data in a shape that needs massaging, do it here.
  // For jsonplaceholder.typicode, the data is already in a workable shape,
  // but we'll keep this function so you can see where to do any transforms.
  return rawData.map((item) => ({
    ...item,
    // For demonstration, item.address is good as-is, but you could
    // rename fields, merge them, etc. in real usage.
  }));
}

/**
 * The main search function that your hook calls.
 * It receives your form criteria plus pagination & sorting info,
 * then returns both `results` and `totalCount`.
 */
export async function searchPeople(
  criteria: SearchCriteria,
  page: number,
  rowsPerPage: number,
  sortField?: string,
  sortDirection?: "asc" | "desc"
): Promise<{ results: PersonRecord[]; totalCount: number }> {
  // Convert the form criteria to actual API params.
  const requestParams = transformSearch(criteria);

  const response = await axios.get(
    "https://jsonplaceholder.typicode.com/users",
    {
      params: {
        ...requestParams,
        // We'll simulate pagination & sorting. Real APIs might use
        // ?page, ?perPage, ?sort, etc. or rely on other parameters.
        _page: page + 1,
        _limit: rowsPerPage,
        _sort: sortField,
        _order: sortDirection,
      },
    }
  );

  // For JSONPlaceholder, we don't get X-Total-Count, so let's just
  // pretend there's 100 total records. Real APIs should return
  // total records in a header or a data property.
  const data = transformResults(response.data);

  return {
    results: data,
    totalCount: 10, // Fake total
  };
}
