# 🧱 Reusable Components

These UI components follow standard patterns for forms, search, and tables. They are meant to be used with the custom hooks for low-boilerplate development.

---

## `SearchForm.tsx`

Renders a dynamic search form with built-in input binding.

### Props

- `fields`: Array of field configs (type, name, label)
- `onChange`: Callback for when field values change

### Example

```tsx
<SearchForm
  fields={[{ name: "email", label: "Email", type: "text" }]}
  onChange={(values) => search(values)}
/>
```

---

## `FormRenderer.tsx`

Takes in a schema-like config and renders a form layout.

- Auto-binds inputs with provided values & handlers
- Designed to work with `useCrudForm`

### Example

```tsx
<FormRenderer
  fields={[{ name: "name", label: "Name", type: "text" }]}
  values={values}
  onChange={handleChange}
/>
```

---

## `Table.tsx`

Table component for displaying paginated, searchable data.

- Works well with `useSearchForm` via `tableProps`
- Supports row selection, sorting, and pagination

### Example

```tsx
<Table
  columns={[{ field: "email", headerName: "Email" }]}
  rows={data}
  {...tableProps}
/>
```

---
