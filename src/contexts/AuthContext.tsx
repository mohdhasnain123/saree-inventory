import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { api, authStorage, setUnauthorizedHandler } from "@/lib/api";

export interface AuthUser {
  _id: string;
  username: string;
  name?: string;
  role: "admin" | "manager" | "staff";
  status: "active" | "inactive";
  passwordChangedAt?: string;
  lastLoginAt?: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

interface MeResponse {
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  canWrite: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const WRITE_ROLES: AuthUser["role"][] = ["admin", "manager"];

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(async () => {
    try {
      if (authStorage.getToken()) {
        await api.post("/auth/logout").catch(() => undefined);
      }
    } finally {
      authStorage.clear();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      const token = authStorage.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.get<MeResponse>("/auth/me");
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) {
          authStorage.clear();
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const data = await api.post<LoginResponse>("/auth/login", {
      username,
      password,
    });
    authStorage.setToken(data.token);
    setUser(data.user);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      canWrite: !!user && WRITE_ROLES.includes(user.role),
      isAdmin: !!user && user.role === "admin",
      login,
      logout,
    }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
