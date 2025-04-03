import { Container, Typography, Button } from "@mui/material";
import { useCrudForm } from "@root/hooks/useCrudForm";
import axios from "axios"; // or use a configured axios instance
import FormRenderer, {
  FormConfigDictionary,
  LayoutConfig,
} from "@components/FormRenderer"; // Adjust import if needed
import { ApiRequest, ApiResponse, FormShape } from "@root/types";

export interface UserApiRequest extends ApiRequest {
  name: string;
  email: string;
  description?: string;
  gender?: string;
  subscribe?: boolean;
  country?: string;
  skills?: string[];
  addresses?: string[];
  customData?: { option: string; checked: boolean };
}

export interface UserApiResponse extends ApiResponse {
  name: string;
  email: string;
  description: string;
  gender: string;
  subscribe: boolean;
  country: string;
  skills: string[];
  addresses: string[];
  customData: { option: string; checked: boolean };
}

/** Extended internal form shape with a nested "profile" object */
export interface UserFormShape extends FormShape {
  name: string;
  email: string;
  description: string;
  gender: string;
  subscribe: boolean;
  country: string;
  skills: string[];
  addresses: {
    street: string;
    city: string;
    zip: string;
  }[];
  customData: { option: string; checked: boolean };
  profile: {
    phone: string;
    address: {
      line1: string;
      line2: string;
      city: string;
    };
  };
}

/** ----------------------------------
 * Form Config: each field’s definition
 * ---------------------------------- */
const formConfig: FormConfigDictionary = {
  name: {
    name: "name",
    // Example label referencing another field ("country")
    label: (fs) => `Name (currently from "${fs.country || "Unknown"}")`,
    type: "text",
    required: true,
    validation: (fs, val) => {
      if (!val) return "Name is required.";
      if (val.trim().length < 2) return "Name must be at least 2 characters.";
      return null;
    },
  },
  email: {
    name: "email",
    label: "Email",
    type: "text",
    required: true,
    validation: (fs, val) => {
      if (!val) return "Email is required.";
      if (!val.includes("@")) return "Email must contain '@'.";
      return null;
    },
  },
  description: {
    name: "description",
    label: "Description",
    type: "textarea",
  },
  gender: {
    name: "gender",
    label: "Gender",
    type: "radio",
    options: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
    ],
  },
  subscribe: {
    name: "subscribe",
    label: (fs) => (fs.name ? `Subscribe ${fs.name}?` : "Subscribe?"),
    type: "checkbox",
    // Mark that we depend on "name" so the label re-renders when name changes
    dynamicDependencies: ["name"],
  },
  country: {
    name: "country",
    // For demonstration, let's have the label reflect subscription status
    label: (fs) =>
      fs.subscribe ? "Country (Subscribed)" : "Country (Not Subscribed)",
    type: "select",
    options: [
      { label: "USA", value: "usa" },
      { label: "Canada", value: "canada" },
    ],
    // We re-run this label logic if "subscribe" changes
    dynamicDependencies: ["subscribe"],
  },
  skills: {
    name: "skills",
    label: "Skills",
    type: "multiselect",
    options: [
      { label: "JavaScript", value: "javascript" },
      { label: "React", value: "react" },
      { label: "TypeScript", value: "typescript" },
    ],
  },
  addresses: {
    name: "addresses",
    label: (fs) => `Addresses for ${fs.name || "Unknown User"}`,
    type: "list",
    columns: [
      { key: "street", label: "Street" },
      { key: "city", label: "City" },
      { key: "zip", label: "ZIP Code" },
    ],
  },
  customData: {
    name: "customData",
    label: "Custom Field",
    type: "composite",
    customRender: (value, onChange, error) => (
      <div style={{ marginTop: 8 }}>
        <Typography variant="subtitle1">Custom Field</Typography>
        <input
          type="text"
          value={value.option}
          onChange={(e) => onChange({ ...value, option: e.target.value })}
        />
        <input
          type="checkbox"
          checked={value.checked}
          onChange={(e) => onChange({ ...value, checked: e.target.checked })}
          style={{ marginLeft: 8 }}
        />
        {error && <div style={{ color: "red" }}>{error}</div>}
      </div>
    ),
    // We depend on both "subscribe" and "country"
    dynamicDependencies: ["subscribe", "country"],
  },

  /** -----------------------------
   *  Examples of nested subfields
   * ----------------------------- */
  "profile.phone": {
    name: "profile.phone",
    label: "Phone Number",
    type: "text",
  },
  "address.street": {
    name: "address.street",
    // Example label override referencing subscribe
    label: (fs) =>
      fs.subscribe
        ? "Address Line 1 (Subscriber)"
        : "Address Line 1 (Non-subscriber)",
    type: "text",
    // We re-run the label if `subscribe` changes:
    dynamicDependencies: ["subscribe"],
    // Validation example: if subscribe is true, require line1
    validation: (fs, val) => {
      if (fs.subscribe && !val) {
        return "Line 1 is required for subscribers";
      }
      return null;
    },
  },
  "profile.address.line2": {
    name: "profile.address.line2",
    label: "Address Line 2",
    type: "text",
  },
  "profile.address.city": {
    name: "profile.address.city",
    label: "City",
    type: "text",
  },
};

/** ----------------------------------
 * Layout Config describing how fields
 * are arranged in rows/columns.
 * ---------------------------------- */
const exampleLayout: LayoutConfig = {
  rows: [
    {
      columns: [
        {
          fields: ["name", "email"],
          gridProps: { xs: 12, sm: 6 },
        },
        {
          fields: ["gender", "subscribe"],
          gridProps: { xs: 12, sm: 6 },
        },
      ],
    },
    {
      columns: [{ fields: ["description"], gridProps: { xs: 12 } }],
    },
    {
      columns: [
        { fields: ["country"], gridProps: { xs: 12, sm: 6 } },
        { fields: ["skills"], gridProps: { xs: 12, sm: 6 } },
      ],
    },
    {
      columns: [{ fields: ["addresses"], gridProps: { xs: 12 } }],
    },
    {
      columns: [{ fields: ["customData"], gridProps: { xs: 12 } }],
    },
    {
      // A row for the nested "profile" fields
      columns: [
        {
          gridProps: { xs: 12, sm: 6 },
          fields: ["profile.phone"],
        },
        {
          gridProps: { xs: 12, sm: 6 },
          fields: [
            "address.street",
            "profile.address.line2",
            "profile.address.city",
          ],
        },
      ],
    },
  ],
};

/** ----------------------------------
 * Example Page using the form
 * ---------------------------------- */
export default function ExampleFormPage() {
  // Use a custom hook that fetches data, sets defaults, etc.
  const { formData, setFormData, isLoading, update, resetForm } =
    useCrudForm<UserFormShape>({
      id: "1",
      fetch: async () => {
        const res = await axios.get(
          "https://jsonplaceholder.typicode.com/users/1"
        );
        const data = res.data;

        // Return shaped data with a nested "profile" object
        return {
          ...data,
          subscribe: false,
          addresses: [],
          customData: data.customData || { option: "", checked: false },
          profile: {
            phone: "",
            address: {
              line1: "",
              line2: "",
              city: "",
            },
          },
        };
      },
      update: (formData) =>
        axios.put("https://jsonplaceholder.typicode.com/users/1", formData),
      defaults: {
        name: "",
        email: "",
        description: "",
        gender: "",
        subscribe: false,
        country: "",
        skills: [],
        addresses: [],
        customData: { option: "", checked: false },
        profile: {
          phone: "",
          address: {
            line1: "",
            line2: "",
            city: "",
          },
        },
      },
    });

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Example Form with Nested Fields & Dynamic Labels
      </Typography>

      <FormRenderer
        formConfig={formConfig}
        formState={formData}
        layoutConfig={exampleLayout}
        onFieldChange={(fieldPath, updatedState) => {
          // Here, updatedState is the entire new form object after setNestedValue.
          setFormData(updatedState);
        }}
      />

      <Button
        onClick={() => update(formData)}
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
      >
        Save
      </Button>

      <Button
        onClick={() => resetForm()}
        variant="outlined"
        sx={{ mt: 2, ml: 1 }}
      >
        Reset
      </Button>
    </Container>
  );
}
