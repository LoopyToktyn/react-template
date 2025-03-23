# 🧩 Custom Hooks

These custom hooks power form behavior and search features with minimal boilerplate. They integrate tightly with React Query and controlled inputs.

---

## `useCrudForm.ts`

A hook designed to manage the state and logic behind a create/update form. It provides:

- **Form state** (`values`, `setValue`, `reset`)
- **Submission logic**
- **Loading indicators**
- Optional `initialValues` and async `onSubmit` handlers

### Example Usage

```tsx
const { values, handleChange, handleSubmit, loading } = useCrudForm({
  initialValues: { name: "", email: "" },
  onSubmit: async (values) => {
    await api.save(values);
  },
});
```

➡️ See: [`src/pages/ExampleFormPage.tsx`](../src/pages/ExampleFormPage.tsx)

---

## `useSearchForm.ts`

A hook for managing search criteria and auto-syncing them with a list component (like a table). It handles:

- Form input state for filters/search params
- Pagination and sorting
- Integration with `react-query` for automatic fetches

### Example Usage

```tsx
const { values, tableProps, handleChange } = useSearchForm({
  queryKey: ["users"],
  searchFn: fetchUsers,
});
```

- `tableProps` is ready-to-bind to the `<Table />` component.
- Updates and pagination are reactive.

---

➡️ See: [`src/pages/ExampleSearchPage.tsx`](../src/pages/ExampleSearchPage.tsx)
