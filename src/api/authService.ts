// src/services/AuthService.ts
import { AuthService } from "@context/AuthContext";
import axiosInstance from "@api/axiosInstance";

export const authService: AuthService = {
  async login(username, password) {
    // Example real call:
    // (Make sure the server returns a 200 if success, sets a session cookie, etc)
    await axiosInstance.post("/api/login", { username, password });
  },

  async logout() {
    // Example: remove the session cookie server-side
    await axiosInstance.post("/api/logout", {});
  },

  async fetchRoles() {
    // If the cookie is valid, return roles
    // If the user is logged out or the cookie is expired, 401 => we throw
    const { data } = await axiosInstance.get("/api/roles");
    return data.roles;
  },
};
