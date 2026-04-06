import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getMe, logoutUsuario } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

const USER_KEY = "nopales_user";

export interface UsuarioInfo {
  id: string;
  nombre: string;
  correo: string;
  rol: "admin" | "ciudadano";
}

interface AuthContextValue {
  usuario: UsuarioInfo | null;
  isLoading: boolean;
  login: (usuario: UsuarioInfo) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al montar: validar la sesión real contra el backend.
  // La cookie JWT es la única fuente de verdad — localStorage no se usa para inicializar.
  useEffect(() => {
    getMe()
      .then((data) => {
        localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
        setUsuario(data.usuario);
      })
      .catch(() => {
        localStorage.removeItem(USER_KEY);
        queryClient.clear();
        setUsuario(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = (nuevoUsuario: UsuarioInfo) => {
    queryClient.clear();
    localStorage.setItem(USER_KEY, JSON.stringify(nuevoUsuario));
    setUsuario(nuevoUsuario);
  };

  const logout = async () => {
    try {
      await logoutUsuario();
    } finally {
      queryClient.clear();
      localStorage.removeItem(USER_KEY);
      setUsuario(null);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, isLoading, login, logout, isAuthenticated: !!usuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
