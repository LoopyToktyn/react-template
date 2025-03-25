// src/api/mock/mockAuthService.ts
import { AuthService } from "@context/AuthContext";

export const mockAuthService: AuthService = {
  async login(username: string, password: string) {
    // Simple “pretend” login with a short delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    // no-op since mock
  },

  async logout() {
    // In a real app you might do something here
  },

  async fetchRoles() {
    // The mock always returns roles so that a user
    // is considered “logged in” after login
    return ["USER", "ADMIN"];
  },
};
