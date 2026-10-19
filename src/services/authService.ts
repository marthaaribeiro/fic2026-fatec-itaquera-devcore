import { normalizarTipoUsuario } from "../lib/auth";
import { api } from "../lib/api";
import type { LoginResposta, TipoUsuario, Usuario } from "../types/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

interface RespostaLoginServidor {
  token?: unknown;
  mensagem?: string;
  message?: string;
}

interface PayloadToken {
  id?: number;
  tipo?: string;
}

export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
  tipo: "voluntario" | "func";
  aniversario: string;
  tel: string;
  end: string;
  cep: string;
  sobre: string;
}

export async function buscarUsuarioAtual(): Promise<Usuario> {
  return (await api.get<Usuario>("/auth/me")).data;
}

async function lerResposta(
  response: Response,
): Promise<RespostaLoginServidor> {
  const resultado: unknown = await response.json().catch(() => null);
  if (!resultado || typeof resultado !== "object" || Array.isArray(resultado)) {
    return {};
  }
  return resultado;
}

function lerPayloadToken(token: string): PayloadToken {
  const segmento = token.split(".")[1];
  if (!segmento) throw new Error("O servidor retornou um token inválido.");

  try {
    const base64 = segmento.replace(/-/g, "+").replace(/_/g, "/");
    const payload = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    return JSON.parse(payload) as PayloadToken;
  } catch {
    throw new Error("O servidor retornou um token inválido.");
  }
}

function tipoParaContrato(
  perfil: ReturnType<typeof normalizarTipoUsuario>,
): TipoUsuario {
  if (perfil === "admin") return "adm";
  if (perfil === "colaborador") return "func";
  return "voluntario";
}

export async function autenticarUsuario(
  email: string,
  senha: string,
): Promise<LoginResposta> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  const resultado = await lerResposta(response);
  if (!response.ok || typeof resultado.token !== "string") {
    throw new Error(
      resultado.mensagem || resultado.message || "Não foi possível entrar.",
    );
  }

  const payload = lerPayloadToken(resultado.token);
  if (!payload.tipo) throw new Error("O perfil da conta não foi informado.");

  const perfil = normalizarTipoUsuario(payload.tipo);
  const nome =
    perfil === "admin"
      ? "Administrador"
      : perfil === "colaborador"
        ? "Colaborador"
        : "Voluntário";

  return {
    token: resultado.token,
    usuario: {
      id: payload.id ?? 1,
      nome,
      email,
      tipo: tipoParaContrato(perfil),
    },
  };
}

export async function cadastrarUsuario(
  dados: DadosCadastro,
): Promise<{ mensagem: string }> {
  const response = await fetch(`${API_BASE_URL}/cadastro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  const resultado = await lerResposta(response);
  if (!response.ok) {
    throw new Error(
      resultado.mensagem || resultado.message || "Não foi possível cadastrar.",
    );
  }
  return {
    mensagem:
      typeof resultado.mensagem === "string"
        ? resultado.mensagem
        : "Cadastro realizado com sucesso.",
  };
}
