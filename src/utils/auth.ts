// Utility functions for handling authentication more generically

export const getToken = (): string | null => {
    return localStorage.getItem("token");
  };
  
  export const setToken = (token: string) => {
    localStorage.setItem("token", token);
  };
  
  export const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
  };
  