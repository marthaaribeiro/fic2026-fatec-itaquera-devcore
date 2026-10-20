import { useEffect, useState } from "react";
import {
  atualizarEventoApi,
  buscarEventosApi,
  criarEventoApi,
  removerEventoApi,
} from "../../services/eventApiService";
import type { EventoGlobal } from "../../types/event";

type DadosEvento = Pick<
  EventoGlobal,
  "titulo" | "data" | "local" | "comentarios"
>;

export function useDashboardEventos() {
  const [eventos, setEventos] = useState<EventoGlobal[]>([]);
  const [erroAgenda, setErroAgenda] = useState<string | null>(null);
  const [salvandoEvento, setSalvandoEvento] = useState(false);

  useEffect(() => {
    let ativo = true;

    buscarEventosApi()
      .then((dados) => {
        if (ativo) setEventos(dados);
      })
      .catch((error: unknown) => {
        if (ativo) {
          setErroAgenda(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os eventos.",
          );
        }
      });

    return () => {
      ativo = false;
    };
  }, []);

  async function salvarEvento(id: number | null, dados: DadosEvento) {
    setSalvandoEvento(true);
    setErroAgenda(null);
    try {
      if (id !== null) {
        const atualizado = await atualizarEventoApi(id, dados);
        setEventos((atuais) =>
          atuais.map((evento) =>
            evento.id === atualizado.id ? atualizado : evento,
          ),
        );
      } else {
        const criado = await criarEventoApi(dados);
        setEventos((atuais) => [criado, ...atuais]);
      }
      return true;
    } catch (error) {
      setErroAgenda(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o evento.",
      );
      return false;
    } finally {
      setSalvandoEvento(false);
    }
  }

  async function excluirEvento(id: number) {
    setErroAgenda(null);
    try {
      await removerEventoApi(id);
      setEventos((atuais) => atuais.filter((evento) => evento.id !== id));
      return true;
    } catch (error) {
      setErroAgenda(
        error instanceof Error
          ? error.message
          : "Não foi possível remover o evento.",
      );
      return false;
    }
  }

  return {
    eventos,
    erroAgenda,
    salvandoEvento,
    salvarEvento,
    excluirEvento,
  };
}
