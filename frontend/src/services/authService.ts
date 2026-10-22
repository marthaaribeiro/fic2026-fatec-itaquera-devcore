// src/services/authService.ts
import { normalizarTipoUsuario } from "../lib/auth";
import { api, lerErro } from "../lib/api";
import { obterSessaoUsuario } from "../lib/storage";
import type { 
  CadastroDados, 
  LoginRespostasFrontend, 
  LoginRespostasServidor, 
  TipoUsuario, 
  Usuario 
} from "../types/auth";

interface PayloadToken {
  id: number;
  tipo: string;
}

function lerPayloadToken(token: string): PayloadToken {
  const segmento = token.split(".")[1];
  if (!segmento) throw new Error("O servidor retornou um token inválido.");

  try {
    const base64 = segmento.replace(/-/g, "+").replace(/_/g, "/");
    const payloadBytes = Uint8Array.from(
      atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")),
      (character) => character.charCodeAt(0)
    );
    const payload = new TextDecoder().decode(payloadBytes);
    const parsed: unknown = JSON.parse(payload);
    
    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed) ||
      !("id" in parsed) ||
      typeof parsed.id !== "number" ||
      !Number.isInteger(parsed.id) ||
      parsed.id < 1 ||
      !("tipo" in parsed) ||
      typeof parsed.tipo !== "string"
    ) {
      throw new Error("O servidor retornou um token inválido.");
    }
    return { id: parsed.id, tipo: parsed.tipo };
  } catch {
    throw new Error("O servidor retornou um token inválido.");
  }
}

function tipoParaContrato(perfil: ReturnType<typeof normalizarTipoUsuario>): TipoUsuario {
  if (perfil === "admin") return "adm";
  if (perfil === "colaborador") return "func";
  return "voluntario";
}

export async function buscarUsuarioAtual(): Promise<Usuario> {
  const sessao = obterSessaoUsuario();
  if (!sessao) {
    throw new Error("A sessão não contém um usuário válido. Entre novamente.");
  }

  const id = Number(sessao.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new Error("A sessão contém um identificador de usuário inválido.");
  }

  return {
    id,
    nome: sessao.nome,
    email: sessao.email,
    tipo: tipoParaContrato(sessao.tipo),
  };
}

export async function autenticarUsuario(
  email: string,
  senha: string
): Promise<LoginRespostasFrontend> {
  try {
    const { data: resultado } = await api.post<LoginRespostasServidor>(
      "/login",
      { email, senha }
    );

    if (typeof resultado.token !== "string") {
      throw new Error(
        resultado.mensagem || "Não foi possível entrar."
      );
    }

    const payload = lerPayloadToken(resultado.token);
    const perfilNormalizado = normalizarTipoUsuario(payload.tipo);
    
    const nomeAmigavel = 
      perfilNormalizado === "admin"
        ? "Administrador"
        : perfilNormalizado === "colaborador"
        ? "Colaborador"
        : "Voluntário";

    return {
      token: resultado.token,
      usuario: {
        id: payload.id,
        nome: resultado.usuario?.nome || nomeAmigavel,
        email: email,
        tipo: perfilNormalizado,
      },
    };
  } catch (error) {
    throw new Error(lerErro(error).mensagem, { cause: error });
  }
}

export async function cadastrarUsuario(
  dados: CadastroDados
): Promise<{ mensagem: string }> {
  try {
    // Traduz o tipo amigável para o que o back-end espera ("func" para funcionários)
    const tipoBackend = dados.tipo === "funcionário" ? "func" : "voluntario";
    
    const payloadEnvio = {
      ...dados,
      tipo: tipoBackend,
      cargo: tipoBackend === "func" ? (dados.cargo || "Colaborador da ONG") : undefined,
    };

    const { data: resultado } = await api.post<LoginRespostasServidor>(
      "/cadastro",
      payloadEnvio
    );

    return {
      mensagem:
        typeof resultado.mensagem === "string"
          ? resultado.mensagem
          : "Cadastro realizado com sucesso.",
    };
  } catch (error) {
    throw new Error(lerErro(error).mensagem, { cause: error });
  }
}