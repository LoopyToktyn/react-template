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

// Simulate fetching data from an API
async function dummyFetchSearchResults(
  criteria: SearchCriteria
): Promise<PersonRecord[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Hard-coded "database"
      const allRecords: PersonRecord[] = [
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
        {
          id: 104,
          person: {
            name: { first: "Daisy", last: "Miller" },
            gender: "Female",
          },
          contact: {
            email: "daisy@example.org",
            phone: { number: "(555) 888-9999" },
            preferred: true,
          },
          address: {
            street: { line1: "55 Maple Ave", line2: "Suite 100" },
            city: "Lakeside",
            state: "TX",
          },
          actions: {
            profile: {
              avatarUrl: "https://i.pravatar.cc/60?u=daisy",
              link: "https://example.com/users/104",
            },
            favorite: true,
            admin: true,
          },
          active: true,
        },
      ];

      // Simple local filtering
      let filtered = allRecords;
      if (criteria.textQuery) {
        const q = criteria.textQuery.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.person.name.first.toLowerCase().includes(q) ||
            r.person.name.last.toLowerCase().includes(q) ||
            r.contact.email.toLowerCase().includes(q) ||
            r.address.street.line1.toLowerCase().includes(q) ||
            (r.address.street.line2 || "").toLowerCase().includes(q) ||
            r.address.city.toLowerCase().includes(q)
        );
      }
      if (criteria.showActive) {
        filtered = filtered.filter((r) => r.active);
      }

      resolve(filtered);
    }, 750); // pretend network latency
  });
}

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
  const [criteria, setCriteria] = useState<SearchCriteria>({});
  const [results, setResults] = useState<PersonRecord[]>([]);

  const handleSearch = async () => {
    const data = await dummyFetchSearchResults(criteria);
    setResults(data);
  };

  // On mount, do an initial search
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line
  }, []);

  return (
    <Container maxWidth={false} sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Complicated Search + Table Example
      </Typography>

      <SearchForm
        criteria={criteria}
        onChange={setCriteria}
        onSearch={handleSearch}
      />

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
