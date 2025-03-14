import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Avatar,
  Checkbox,
  FormControlLabel,
  TextField,
} from "@mui/material";
import { SearchTable, TableColumn } from "@components/SearchTable";
import ExampleSearchForm from "@root/components/ExampleSearchForm";

/** User's search criteria: can expand as needed. */
interface SearchCriteria {
  textQuery?: string;
  showActive?: boolean;
}

/**
 * We'll define a type for the complicated data. This is for
 * demonstration only, so each record has lots of nested
 * fields that will produce multi-level headers.
 */
interface PersonRecord {
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

// -------------------------
// 2) Example “SearchForm” (simplified, config-driven)

interface SearchFormProps {
  criteria: SearchCriteria;
  onChange: (criteria: SearchCriteria) => void;
  onSearch: () => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
  criteria,
  onChange,
  onSearch,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        mb: 2,
        alignItems: "flex-end",
        flexWrap: "wrap",
      }}
    >
      <Box>
        <Typography variant="body2">Search Query</Typography>
        <TextField
          size="small"
          value={criteria.textQuery ?? ""}
          onChange={(e) => onChange({ ...criteria, textQuery: e.target.value })}
        />
      </Box>
      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={criteria.showActive ?? false}
              onChange={(e) =>
                onChange({ ...criteria, showActive: e.target.checked })
              }
            />
          }
          label="Show Active Only"
        />
      </Box>
      <Box>
        <Button variant="contained" onClick={onSearch}>
          Search
        </Button>
      </Box>
    </Box>
  );
};

// -------------------------
// 6) Example Table Columns with multi-level subColumns & custom cells

const complicatedColumns: TableColumn<PersonRecord>[] = [
  {
    header: "ID",
    field: "id", // used for sorting
  },
  {
    header: "Person",
    subColumns: [
      {
        header: "Name",
        subColumns: [
          {
            header: "First",
            field: "person.name.first",
          },
          {
            header: "Last",
            field: "person.name.last",
          },
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
          <Checkbox
            readOnly
            disabled
            checked={item.contact.preferred}
            size="small"
          />
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
          {
            header: "Line 1",
            field: "address.street.line1",
          },
          {
            header: "Line 2",
            field: "address.street.line2",
          },
        ],
      },
      {
        header: "City",
        field: "address.city",
      },
      {
        header: "State",
        field: "address.state",
      },
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
              <Avatar
                alt={item.person.name.first}
                src={item.actions.profile.avatarUrl}
                sx={{ width: 24, height: 24 }}
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
          <Checkbox
            readOnly
            disabled
            icon={<span style={{ opacity: 0.4 }}>☆</span>}
            checkedIcon={<span style={{ color: "gold" }}>★</span>}
            checked={item.actions.favorite}
            size="small"
          />
        ),
      },
      {
        header: "Admin?",
        field: "actions.admin",
        customRender: (item) => (
          <Checkbox
            readOnly
            disabled
            checked={item.actions.admin}
            size="small"
          />
        ),
      },
    ],
  },
];

// -------------------------
// The main “SearchPage” component

export default function ExampleSearchPage() {
  const [results, setResults] = useState<PersonRecord[]>([]);

  const handleSearch = async (data: PersonRecord[]) => {
    setResults(data);
  };

  return (
    <Container maxWidth={false} sx={{ mt: 4 }}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontFamily: "Orbitron , sans-serif",
            background: "linear-gradient(90deg, #ff6f61, #1976d2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Complicated Search + Table Example
        </Typography>
        <ExampleSearchForm onSearchResults={handleSearch} />
      </Container>

      {results.length > 0 ? (
        <SearchTable<PersonRecord>
          columns={complicatedColumns}
          data={results}
          defaultSortField="id"
          defaultSortDirection="asc"
          rowsPerPage={10}
        />
      ) : (
        <Typography variant="body2" color="text.secondary">
          No results to display. Try searching above!
        </Typography>
      )}
    </Container>
  );
}
