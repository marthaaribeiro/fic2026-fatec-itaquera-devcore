import { api, lerErro } from "../lib/api";
import type { EventoGlobal, EventoServidor } from "../types/event";
export type { EventoGlobal } from "../types/event";

type RespostaCriacaoEvento = {
  idEvento?: number | string;
  mensagem?: string;
};

function mapearEvento(evento: EventoServidor): EventoGlobal {
  const data = evento.data_evento ?? evento.data ?? "";
  const descricao =
    evento.desc_evento ??
    evento.desc ??
    evento.comentarios ??
    evento.description ??
    "";

  return {
    id: Number(evento.ID_evento ?? evento.id_evento ?? evento.id),
    titulo: evento.nome_evento ?? evento.nome ?? evento.titulo ?? "Evento",
    data: typeof data === "string" ? data.split("T")[0] : "",
    comentarios: descricao,
    description: descricao,
    local: evento.localizacao ?? evento.local ?? "Campinas",
  };
}

function lancarErroApi(erro: unknown): never {
  throw new Error(lerErro(erro).mensagem);
}

export async function buscarEventosApi(): Promise<EventoGlobal[]> {
  try {
    const { data } = await api.get<EventoServidor[]>("/eventos");
    return Array.isArray(data) ? data.map(mapearEvento) : [];
  } catch (error) {
    return lancarErroApi(error);
  }
}

export async function criarEventoApi(
  novo: Pick<EventoGlobal, "titulo" | "data" | "local" | "comentarios">,
): Promise<EventoGlobal> {
  let data: RespostaCriacaoEvento;
  try {
    const response = await api.post<RespostaCriacaoEvento>("/eventos", {
      nome: novo.titulo.trim(),
      data: novo.data,
      localizacao: novo.local.trim(),
      desc: novo.comentarios.trim(),
    });
    data = response.data;
  } catch (error) {
    return lancarErroApi(error);
  }

  if (
    data.idEvento === undefined ||
    data.idEvento === null ||
    data.idEvento === ""
  ) {
    throw new Error(data.mensagem || "O servidor não confirmou o evento.");
  }

  const descricao = novo.comentarios.trim();
  return {
    id: Number(data.idEvento),
    titulo: novo.titulo.trim(),
    data: novo.data,
    local: novo.local.trim(),
    comentarios: descricao,
    description: descricao,
  };
}

export async function atualizarEventoApi(
  id: number,
  evento: Pick<EventoGlobal, "titulo" | "data" | "local" | "comentarios">,
): Promise<EventoGlobal> {
  try {
    await api.put(`/eventos/${id}`, {
      nome: evento.titulo.trim(),
      data: evento.data,
      localizacao: evento.local.trim(),
      desc: evento.comentarios.trim(),
      status: true,
    });

    const descricao = evento.comentarios.trim();
    return {
      id,
      titulo: evento.titulo.trim(),
      data: evento.data,
      local: evento.local.trim(),
      comentarios: descricao,
      description: descricao,
    };
  } catch (error) {
    return lancarErroApi(error);
  }
}

export async function removerEventoApi(id: number): Promise<void> {
  try {
    await api.delete(`/eventos/${id}`);
  } catch (error) {
    lancarErroApi(error);
  }
}
