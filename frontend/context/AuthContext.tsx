"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  access_level: string;
  iat: number;
  exp: number;
}

interface AuthUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  accessLevel: string;
  token: string;
  permissions?: Record<string, boolean>;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (userData: AuthUser) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session on initial load
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("currentUser");

    if (token && userData) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);

        // Check token expiration
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          logout();
          return;
        }

        setUser({ ...JSON.parse(userData), token });
      } catch (error) {
        console.error("Token validation error:", error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: AuthUser) => {
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        id: userData.id,
        userId: userData.userId,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        accessLevel: userData.accessLevel,
        permissions: userData.permissions,
      })
    );
    localStorage.setItem("token", userData.token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setUser(null);
    router.push("/login");
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
