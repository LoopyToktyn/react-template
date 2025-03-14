// ExampleSearchPage.tsx
import React from "react";
import { Box, Container, TextField, Typography } from "@mui/material";
import { SearchForm } from "@components/SearchForm";
import { TableColumn } from "@root/components/Table";
import { FormConfigDictionary, LayoutConfig } from "@root/types";

// Define the search criteria and record interfaces.
export interface SearchCriteria {
  textQuery?: string;
  showActive?: boolean;
  category?: string;
  sortOrder?: string;
  tags?: string[];
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  advancedOptions?: {
    minValue?: number;
    maxValue?: number;
  };
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
  address: {
    street: { line1: string; line2?: string };
    city: string;
    state: string;
  };
  actions: {
    profile: { avatarUrl: string; link: string };
    favorite: boolean;
    admin: boolean;
  };
  active: boolean;
}

// Dummy search function to mimic a search API.
const dummyFetchSearchResults = async (
  criteria: SearchCriteria
): Promise<PersonRecord[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const records: PersonRecord[] = [
        {
          id: 101,
          person: { name: { first: "Alice", last: "Doe" }, gender: "Female" },
          contact: {
            email: "alice@example.com",
            phone: { number: "(555) 111-2222", ext: "123" },
            preferred: true,
          },
          address: {
            street: { line1: "123 Oak St", line2: "Apt 2B" },
            city: "Springfield",
            state: "IL",
          },
          actions: {
            profile: {
              avatarUrl: "https://i.pravatar.cc/60?u=alice",
              link: "https://example.com/users/101",
            },
            favorite: true,
            admin: false,
          },
          active: true,
        },
        {
          id: 102,
          person: { name: { first: "Bob", last: "Smith" }, gender: "Male" },
          contact: {
            email: "bob.smith@foo.org",
            phone: { number: "(555) 333-4444" },
            preferred: false,
          },
          address: {
            street: { line1: "42 Main St" },
            city: "Somewhere",
            state: "CA",
          },
          actions: {
            profile: {
              avatarUrl: "https://i.pravatar.cc/60?u=bob",
              link: "https://example.com/users/102",
            },
            favorite: false,
            admin: true,
          },
          active: false,
        },
        {
          id: 103,
          person: {
            name: { first: "Charlie", last: "Jones" },
            gender: "Nonbinary",
          },
          contact: {
            email: "charlie@bar.net",
            phone: { number: "(555) 666-7777" },
            preferred: false,
          },
          address: {
            street: { line1: "789 Pine Rd" },
            city: "Metropolis",
            state: "NY",
          },
          actions: {
            profile: {
              avatarUrl: "https://i.pravatar.cc/60?u=charlie",
              link: "https://example.com/users/103",
            },
            favorite: false,
            admin: false,
          },
          active: true,
        },
      ];

      let filtered = records;
      if (criteria.textQuery) {
        const q = criteria.textQuery.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.person.name.first.toLowerCase().includes(q) ||
            r.person.name.last.toLowerCase().includes(q) ||
            r.contact.email.toLowerCase().includes(q)
        );
      }
      if (criteria.showActive) {
        filtered = filtered.filter((r) => r.active);
      }
      resolve(filtered);
    }, 750);
  });
};

// Form configuration
const formConfig: FormConfigDictionary = {
  textQuery: {
    name: "textQuery",
    label: "Search Query",
    type: "text",
  },
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
  sortOrder: {
    name: "sortOrder",
    label: "Sort Order",
    type: "radio",
    options: [
      { label: "Ascending", value: "asc" },
      { label: "Descending", value: "desc" },
    ],
  },
  tags: {
    name: "tags",
    label: "Tags",
    type: "multiselect",
    options: [
      { label: "React", value: "react" },
      { label: "JavaScript", value: "javascript" },
      { label: "TypeScript", value: "typescript" },
      { label: "CSS", value: "css" },
    ],
  },
  dateRange: {
    name: "dateRange",
    label: "Date Range",
    type: "composite",
    customRender: (value, onChange, error) => (
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          label="Start Date"
          type="date"
          value={value?.startDate || ""}
          onChange={(e) => onChange({ ...value, startDate: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date"
          type="date"
          value={value?.endDate || ""}
          onChange={(e) => onChange({ ...value, endDate: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
      </Box>
    ),
  },
  advancedOptions: {
    name: "advancedOptions",
    label: "Advanced Options",
    type: "composite",
    customRender: (value, onChange, error) => (
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          label="Min Value"
          type="number"
          value={value?.minValue || ""}
          onChange={(e) =>
            onChange({ ...value, minValue: Number(e.target.value) })
          }
        />
        <TextField
          label="Max Value"
          type="number"
          value={value?.maxValue || ""}
          onChange={(e) =>
            onChange({ ...value, maxValue: Number(e.target.value) })
          }
        />
      </Box>
    ),
  },
};

// Layout configuration
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
    {
      gridProps: { spacing: 2 },
      columns: [
        {
          fields: ["tags"],
          gridProps: { xs: 12 },
        },
      ],
    },
    {
      gridProps: { spacing: 2 },
      columns: [
        {
          fields: ["dateRange"],
          gridProps: { xs: 12 },
        },
      ],
    },
    {
      gridProps: { spacing: 2 },
      columns: [
        {
          fields: ["advancedOptions"],
          gridProps: { xs: 12 },
        },
      ],
    },
  ],
};

// Table columns for the search results table.
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
      {
        header: "Phone",
        subColumns: [
          { header: "Number", field: "contact.phone.number" },
          { header: "Ext", field: "contact.phone.ext" },
        ],
      },
      {
        header: "Preferred?",
        field: "contact.preferred",
        customRender: (item) => (
          <input type="checkbox" readOnly checked={item.contact.preferred} />
        ),
      },
    ],
  },
  {
    header: "Address",
    subColumns: [
      {
        header: "Street",
        subColumns: [
          { header: "Line 1", field: "address.street.line1" },
          { header: "Line 2", field: "address.street.line2" },
        ],
      },
      { header: "City", field: "address.city" },
      { header: "State", field: "address.state" },
    ],
  },
  {
    header: "Actions",
    subColumns: [
      {
        header: "Profile",
        subColumns: [
          {
            header: "Avatar",
            customRender: (item) => (
              <img
                alt={item.person.name.first}
                src={item.actions.profile.avatarUrl}
                style={{ width: 24, height: 24 }}
              />
            ),
          },
          {
            header: "Link",
            customRender: (item) => (
              <a
                href={item.actions.profile.link}
                target="_blank"
                rel="noreferrer"
              >
                View
              </a>
            ),
          },
        ],
      },
      {
        header: "Favorite?",
        field: "actions.favorite",
        customRender: (item) => (
          <input type="checkbox" readOnly checked={item.actions.favorite} />
        ),
      },
      {
        header: "Admin?",
        field: "actions.admin",
        customRender: (item) => (
          <input type="checkbox" readOnly checked={item.actions.admin} />
        ),
      },
    ],
  },
];

export default function ExampleSearchPage() {
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
      <SearchForm<SearchCriteria, PersonRecord>
        defaults={{
          textQuery: "",
          showActive: false,
          category: "all",
          sortOrder: "asc",
          tags: [],
          dateRange: { startDate: "", endDate: "" },
          advancedOptions: { minValue: 0, maxValue: 100 },
        }}
        searchFn={dummyFetchSearchResults}
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
