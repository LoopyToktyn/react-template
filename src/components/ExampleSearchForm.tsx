import React from "react";
import { Box, Button, TextField } from "@mui/material";
import FormRenderer from "@components/FormRenderer";
import { useQuery } from "@tanstack/react-query";
import { FormConfigDictionary, LayoutConfig } from "@root/types";

/**
 * For demonstration we re-use a PersonRecord interface.
 * In your real app you might import this type from a shared types file.
 */
export interface PersonRecord {
  id: number;
  person: {
    name: {
      first: string;
      last: string;
    };
    gender: string;
  };
  contact: {
    email: string;
    phone: {
      number: string;
      ext?: string;
    };
    preferred: boolean;
  };
  address: {
    street: {
      line1: string;
      line2?: string;
    };
    city: string;
    state: string;
  };
  actions: {
    profile: {
      avatarUrl: string;
      link: string;
    };
    favorite: boolean;
    admin: boolean;
  };
  active: boolean;
}

/** The criteria structure for our search. */
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

/**
 * Dummy fetch function – in a real app this would hit your API.
 * For demonstration we filter over a static list.
 */
const dummyFetchSearchResults = async (
  criteria: SearchCriteria
): Promise<PersonRecord[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const records: PersonRecord[] = [
        {
          id: 101,
          person: {
            name: { first: "Alice", last: "Doe" },
            gender: "Female",
          },
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
          person: {
            name: { first: "Bob", last: "Smith" },
            gender: "Male",
          },
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

      // Simple filtering logic: text query and active flag only.
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
      // Additional filters for category, sortOrder, etc. can be added here.
      resolve(filtered);
    }, 750);
  });
};

interface ExampleSearchFormProps {
  onSearchResults: (results: PersonRecord[]) => void;
}

/**
 * A config-driven search form that demonstrates a wide variety
 * of field types and a complex nested layout. When the search button is
 * clicked, we use @tanstack/react-query to fetch the results.
 */
const ExampleSearchForm: React.FC<ExampleSearchFormProps> = ({
  onSearchResults,
}) => {
  const [criteria, setCriteria] = React.useState<SearchCriteria>({
    textQuery: "",
    showActive: false,
    category: "all",
    sortOrder: "asc",
    tags: [],
    dateRange: { startDate: "", endDate: "" },
    advancedOptions: { minValue: 0, maxValue: 100 },
  });

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
            // Nested layout for advanced options to illustrate sub-layouts.
            subLayout: {
              rows: [
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
            },
            gridProps: { xs: 12 },
          },
        ],
      },
    ],
  };

  // Use @tanstack/react-query to perform the search on demand.
  const query = useQuery({
    queryKey: ["search", criteria],
    queryFn: () => dummyFetchSearchResults(criteria),
    enabled: false, // Prevents automatic execution
  });

  // Use an effect to trigger the callback when new data is available
  React.useEffect(() => {
    if (query.data) {
      onSearchResults(query.data);
    }
  }, [query.data, onSearchResults]);

  const handleSearch = () => {
    query.refetch();
  };

  const handleFieldChange = (name: string, value: any) => {
    setCriteria((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box sx={{ mb: 2 }}>
      <FormRenderer
        formConfig={formConfig}
        layoutConfig={layoutConfig}
        formState={criteria}
        onFieldChange={handleFieldChange}
      />
      <Button
        variant="contained"
        onClick={handleSearch}
        sx={{ mt: 2 }}
        disabled={query.isFetching}
      >
        {query.isFetching ? "Searching..." : "Search"}
      </Button>
    </Box>
  );
};

export default ExampleSearchForm;
