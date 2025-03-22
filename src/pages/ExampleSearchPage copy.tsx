// src/pages/ExampleSearchPage.tsx

import { Container, Typography } from "@mui/material";
import { SearchForm } from "@components/SearchForm copy";
import { TableColumn } from "@root/components/Table copy";
import { FormConfigDictionary, LayoutConfig } from "@root/types";
import { UseSearchFormConfig } from "@hooks/useSearchForm copy";

// Define types for our search.
export interface SearchCriteria {
  textQuery?: string;
  showActive?: boolean;
  category?: string;
  sortOrder?: string;
  // Additional form fields...
}

export interface PeopleSearchParams {
  searchText?: string;
  onlyActive?: boolean;
  category?: string;
  sortOrder?: string;
  // Any additional parameters for the API
}

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

// Define your table columns (update as needed)
const tableColumns: TableColumn<PersonRecord>[] = [
  { header: "ID", field: "id" },
  { header: "Name", field: "name" },
  { header: "Username", field: "username" },
  { header: "Email", field: "email" },
  {
    header: "Address",
    subColumns: [
      { header: "Street", field: "address.street" },
      { header: "City", field: "address.city" },
      { header: "Zip", field: "address.zipcode" },
    ],
  },
];

// Example form configuration for FormRenderer.
const formConfig: FormConfigDictionary = {
  textQuery: { name: "textQuery", label: "Search Query", type: "text" },
  showActive: {
    name: "showActive",
    label: "Show Active Only",
    type: "checkbox",
  },
  category: {
    name: "category",
    label: "Category",
    type: "select",
    options: [
      { label: "All", value: "all" },
      { label: "Category A", value: "a" },
      { label: "Category B", value: "b" },
      { label: "Category C", value: "c" },
    ],
  },
  // ... add any additional fields as needed
};

const layoutConfig: LayoutConfig = {
  rows: [
    {
      gridProps: { spacing: 2 },
      columns: [
        {
          fields: ["textQuery", "category"],
          gridProps: { xs: 12, sm: 6 },
        },
        {
          fields: ["showActive", "sortOrder"],
          gridProps: { xs: 12, sm: 6 },
        },
      ],
    },
    // ... additional layout rows if needed
  ],
};

export default function ExampleSearchPage() {
  // Define the search config with transforms.
  const searchConfig: UseSearchFormConfig<
    PeopleSearchParams,
    SearchCriteria,
    PersonRecord
  > = {
    path: "https://jsonplaceholder.typicode.com/users", // Your API endpoint
    method: "GET",
    op: "searchPeople",
    transformOut: (form) => form, // Not doing much for this mock API
    transformResults: (rawData) => rawData, // raw array
    paginationConfig: {
      initialPage: 0,
      rowsPerPage: 10,
      defaultSortField: "id",
      defaultSortDirection: "asc",
    },
  };

  return (
    <Container maxWidth={false} sx={{ mt: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontFamily: "Orbitron, sans-serif",
          background: "linear-gradient(90deg, #ff6f61, #1976d2)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        Complicated Search + Table Example
      </Typography>

      <SearchForm<PeopleSearchParams, SearchCriteria, PersonRecord>
        config={searchConfig}
        formConfig={formConfig}
        layoutConfig={layoutConfig}
        tableColumns={tableColumns}
        tableProps={{
          defaultSortField: "id",
          defaultSortDirection: "asc",
          rowsPerPage: 10,
        }}
      />
    </Container>
  );
}
