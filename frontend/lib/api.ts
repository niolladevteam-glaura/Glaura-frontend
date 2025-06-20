// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3080/api";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Something went wrong");
  }

  return response.json();
}

// Auth API
export const authApi = {
  signin: async (email: string, password: string) => {
    return fetchWithAuth("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  signout: async () => {
    return fetchWithAuth("/auth/signout");
  },
};

// User API
export const userApi = {
  getAllUsers: async () => {
    return fetchWithAuth("/user");
  },
  getUserById: async (id: string) => {
    return fetchWithAuth(`/user/${id}`);
  },
  createUser: async (userData: any) => {
    return fetchWithAuth("/user", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },
  updateUser: async (id: string, userData: any) => {
    return fetchWithAuth(`/user/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },
  deleteUser: async (id: string) => {
    return fetchWithAuth(`/user/${id}`, {
      method: "DELETE",
    });
  },
  toggleUserStatus: async (id: string, isActive: boolean) => {
    return fetchWithAuth(`/user/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
  },
};