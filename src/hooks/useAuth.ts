import { useAuthContext } from "@context/AuthContext";

export function useAuth() {
  const { authEnabled, toggleAuth } = useAuthContext();
  return { authEnabled, toggleAuth };
}
