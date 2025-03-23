# 🌐 Contexts

App-wide state containers for auth, color mode, and loading overlays.

---

## `AuthContext.tsx`

Handles user login state and exposes:

- `login(credentials)`
- `logout()`
- `user` object

### Example

```tsx
const { user, login, logout } = useContext(AuthContext);
```

---

## `ColorModeContext.tsx`

Exposes dark/light mode toggle state using MUI’s theming system.

### Example

```tsx
const { toggleColorMode } = useContext(ColorModeContext);
```

Used in conjunction with `ThemeProvider` to apply global MUI styles.

---

## `LoadingContext.tsx`

Wraps the app with a global loading state provider.

- `setLoading(true|false)`
- Used to show spinners or block UI during transitions.

---
