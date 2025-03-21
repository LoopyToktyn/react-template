// src/pages/ExampleSearchPage.tsx

import React from "react";
import { Box, Container, TextField, Typography } from "@mui/material";
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
  person: {
    name: { first: string; last: string };
    gender: string;
  };
  contact: {
    email: string;
    phone: { number: string; ext?: string };
    preferred: boolean;
  };
  active: boolean;
  // Other fields...
}

// Define your table columns (update as needed)
const complicatedColumns: TableColumn<PersonRecord>[] = [
  {
    header: "ID",
    field: "id",
  },
  {
    header: "Person",
    subColumns: [
      {
        header: "Name",
        subColumns: [
          { header: "First", field: "person.name.first" },
          { header: "Last", field: "person.name.last" },
        ],
      },
      {
        header: "Gender",
        field: "person.gender",
        customRender: (item) => (
          <em style={{ color: "blue" }}>{item.person.gender}</em>
        ),
      },
    ],
  },
  {
    header: "Contact",
    subColumns: [
      {
        header: "Email",
        field: "contact.email",
        customRender: (item) => (
          <a href={`mailto:${item.contact.email}`}>{item.contact.email}</a>
        ),
      },
      // ... other columns
    ],
  },
  // ... additional columns as needed
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
    path: "/api/people", // Your API endpoint
    method: "GET",
    op: "searchPeople",
    transformOut: (form) => {
      return {
        searchText: form.textQuery,
        onlyActive: form.showActive,
        category: form.category !== "all" ? form.category : undefined,
        sortOrder: form.sortOrder,
      };
    },
    transformResults: (rawData) => {
      // Assume the API returns { results: PersonRecord[], count: number }
      return rawData.results ?? [];
    },
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
        tableColumns={complicatedColumns}
        tableProps={{
          defaultSortField: "id",
          defaultSortDirection: "asc",
          rowsPerPage: 10,
        }}
      />
    </Container>
  );
}
