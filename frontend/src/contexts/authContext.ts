import { createContext, useContext } from "react";
import type { LoginResposta, Usuario } from "../types/auth";

interface AuthCtx {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (resposta: LoginResposta) => void;
  sair: () => void;
}

export const AuthContext = createContext<AuthCtx | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return context;
}
