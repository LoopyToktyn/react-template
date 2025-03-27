// src/pages/ExampleSearchPage.tsx

import { Container, Typography } from "@mui/material";
import { SearchForm } from "@components/SearchForm";
import { TableColumn } from "@root/components/Table";
import { UseSearchFormConfig } from "@hooks/useSearchForm";

// Import the service items
import { searchPeople, SearchCriteria, PersonRecord } from "@api/peopleService";

// For your FormRenderer
import { FormConfigDictionary, LayoutConfig } from "@components/FormRenderer";

export const tableColumns: TableColumn<PersonRecord>[] = [
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

// Example form config
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
  // Add others as needed...
};

// Example layout config
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
    // Additional rows...
  ],
};

export default function ExampleSearchPage() {
  // Our new config is simpler: we pass "searchFn" from the service
  const searchConfig: UseSearchFormConfig<SearchCriteria, PersonRecord> = {
    searchFn: searchPeople, // main difference: we pass a function
    initialValues: {}, // optionally set default form values
    initialPage: 0,
    rowsPerPage: 10,
    defaultSortField: "id",
    defaultSortDirection: "asc",
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
        Hybrid Search + Table Example
      </Typography>

      <SearchForm<SearchCriteria, PersonRecord>
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
