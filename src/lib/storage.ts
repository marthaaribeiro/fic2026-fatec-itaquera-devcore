import { normalizarTipoUsuario } from "./auth";
import type { SessaoUsuario } from "../types/auth";

const TOKEN_KEY = "ong_token";
const USER_KEY = "ong_usuario";
const ALERT_KEY = "ong_alerta_seguranca";

function obterToken(): string | null {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) return token;

  const tokenAntigo = localStorage.getItem("token");
  if (!tokenAntigo) return null;

  sessionStorage.setItem(TOKEN_KEY, tokenAntigo);
  localStorage.removeItem("token");
  return tokenAntigo;
}

export const tokenStorage = {
  get: obterToken,
  set(token: string) {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem("token");
  },
  clear() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
  },
};

export function salvarSessaoAutenticada(
  token: string,
  usuario: Omit<SessaoUsuario, "token">,
): void {
  try {
    sessionStorage.setItem(USER_KEY, JSON.stringify(usuario));
    tokenStorage.set(token);
    localStorage.removeItem("usuario");
  } catch (error) {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } catch {
      // Preserve the original storage error for the caller.
    }
    throw error;
  }
}

export function obterSessaoUsuario(): SessaoUsuario | null {
  try {
    const token = tokenStorage.get();
    if (!token) return null;

    let rawUser = sessionStorage.getItem(USER_KEY);
    if (!rawUser) {
      rawUser = localStorage.getItem("usuario");
      if (rawUser) {
        sessionStorage.setItem(USER_KEY, rawUser);
        localStorage.removeItem("usuario");
      }
    }
    if (!rawUser) return null;

    const parsed: unknown = JSON.parse(rawUser);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("email" in parsed) ||
      typeof parsed.email !== "string" ||
      !("tipo" in parsed) ||
      typeof parsed.tipo !== "string"
    ) {
      return null;
    }

    const tipo = normalizarTipoUsuario(parsed.tipo);
    const nome =
      "nome" in parsed && typeof parsed.nome === "string" && parsed.nome
        ? parsed.nome
        : tipo === "admin"
          ? "Administrador"
          : tipo === "colaborador"
            ? "Colaborador"
            : "Voluntário";

    return {
      id:
        "id" in parsed &&
        (typeof parsed.id === "number" || typeof parsed.id === "string")
          ? parsed.id
          : 1,
      nome,
      email: parsed.email,
      tipo,
      token,
    };
  } catch {
    return null;
  }
}

export function limparSessaoUsuario(): void {
  try {
    tokenStorage.clear();
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(ALERT_KEY);
    localStorage.removeItem("usuario");
    window.dispatchEvent(new CustomEvent("ong_auth_change"));
  } catch (error) {
    console.error("Erro ao limpar sessão:", error);
  }
}

export function definirAlertaSeguranca(mensagem: string): void {
  try {
    sessionStorage.setItem(ALERT_KEY, mensagem);
  } catch {
    // O armazenamento de sessão pode estar indisponível no navegador.
  }
}

export function obterEConsumirAlertaSeguranca(): string | null {
  try {
    const alerta = sessionStorage.getItem(ALERT_KEY);
    if (alerta) sessionStorage.removeItem(ALERT_KEY);
    return alerta;
  } catch {
    return null;
  }
}
