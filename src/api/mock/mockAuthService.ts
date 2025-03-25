// src/api/mock/mockAuthService.ts
import { AuthService } from "@context/AuthContext";

let mockSessionActive = false;

export const mockAuthService: AuthService = {
  async login(username, password) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    mockSessionActive = true;
  },

  async logout() {
    mockSessionActive = false;
  },

  async fetchRoles() {
    if (!mockSessionActive) {
      const error = new Error("Not logged in");
      (error as any).status = 401;
      throw error;
    }

    return ["USER", "ADMIN"];
  },
};
