import type { FormEvent } from "react";
import { EventCalendar } from "../../components/EventCalendar/EventCalendar";
import { LogoutButton } from "../../components/LogoutButton/LogoutButton";
import { useDashboardEventos } from "../../hooks/api/useDashboardEventos";
import { useMedicamentosStorage } from "../../hooks/storage/useMedicamentosStorage";
import { useDashboardAdminUI } from "../../hooks/ui/useDashboardAdminUI";
import {
  Pill,
  HandCoins,
  ArrowRight,
  Plus,
  X,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
const EVENTOS_VISIVEIS_INICIALMENTE = 2;

function navegarPara(caminho: string) {
  window.history.pushState({}, "", caminho);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function DashboardAdmin() {
  const {
    eventos,
    erroAgenda,
    salvandoEvento,
    salvarEvento,
    excluirEvento,
  } = useDashboardEventos();
  const { medicamentos } = useMedicamentosStorage({
    listenToAuthChange: true,
  });
  const {
    mostrarTodosEventos,
    setMostrarTodosEventos,
    novoEvento,
    setNovoEvento,
    eventoEmEdicao,
    setEventoEmEdicao,
    formularioAberto,
    setFormularioAberto,
    limparFormulario,
  } = useDashboardAdminUI();

  const totalEstoque = medicamentos.reduce((acc, m) => acc + m.quantidade, 0);

  const eventosExibidos = mostrarTodosEventos
    ? eventos
    : eventos.slice(0, EVENTOS_VISIVEIS_INICIALMENTE);

  async function criarEvento(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!novoEvento.titulo.trim() || !novoEvento.data) return;

    const dadosEvento = {
      titulo: novoEvento.titulo.trim(),
      data: novoEvento.data,
      comentarios: novoEvento.comentarios.trim(),
      local: novoEvento.local.trim(),
    };

    if (await salvarEvento(eventoEmEdicao, dadosEvento)) limparFormulario();
  }

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 py-8 md:px-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="m-0 font-body text-xs font-bold uppercase tracking-wide text-gold">
            Central de gestão · acesso restrito
          </p>
          <h1 className="m-0 font-display text-[28px] font-semibold text-black md:text-[32px]">
            Olá, administração.
          </h1>
          <p className="m-0 mt-1.5 max-w-md font-body text-sm text-ink-soft">
            Uma visão geral para cuidar da operação e das pessoas que fazem a
            missão acontecer.
          </p>
        </div>
        <LogoutButton />
      </header>

      <section
        aria-label="Resumos da organização"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <article className="flex flex-col gap-1 rounded-md border border-black/10 bg-white p-5">
          <span className="font-body text-[12.5px] text-ink-soft">
            Estoque total
          </span>
          <strong className="font-display text-2xl font-semibold text-black">
            {totalEstoque || medicamentos.length}
          </strong>
          <small className="font-body text-xs text-ink-soft">
            unidades cadastradas
          </small>
        </article>
        <article className="flex flex-col gap-1 rounded-md border border-black/10 bg-white p-5">
          <span className="font-body text-[12.5px] text-ink-soft">
            Doações no mês
          </span>
          <strong className="font-display text-2xl font-semibold text-black">
            R$ 4.230,50
          </strong>
          <small className="font-body text-xs text-ink-soft">
            27 registros manuais
          </small>
        </article>
      </section>

      {/* medicamentos + doacoes */}
      <section
        className="grid grid-cols-1 gap-6 sm:grid-cols-2"
        aria-label="Gestão operacional"
      >
        <article className="group flex flex-col gap-3 rounded-xl border border-black/10 bg-white p-7 transition-all hover:border-black/20 hover:shadow-md">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <Pill size={20} />
            </span>
            <p className="m-0 font-body text-xs font-bold uppercase tracking-wide text-gold">
              Farmácia social
            </p>
          </div>

          <h2 className="m-0 font-display text-[1.15rem] font-semibold text-black">
            Medicamentos
          </h2>

          <p className="m-0 flex-grow font-body text-sm text-ink-soft">
            Confira validade, lotes e níveis de estoque antes dos próximos
            atendimentos.
          </p>

          <button
            type="button"
            onClick={() => navegarPara("/dashboard/medicamentos")}
            className="mt-2 inline-flex items-center justify-between gap-2 rounded-pill border border-black/15 bg-white px-4 py-3 font-body text-[13px] font-bold text-black transition-colors hover:bg-black/5 active:scale-[0.98]"
          >
            Abrir cadastro de medicamentos
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </article>

        <article className="group flex flex-col gap-3 rounded-xl border border-black/10 bg-white p-7 transition-all hover:border-black/20 hover:shadow-md">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <HandCoins size={20} />
            </span>
            <p className="m-0 font-body text-xs font-bold uppercase tracking-wide text-gold">
              Financeiro
            </p>
          </div>

          <h2 className="m-0 font-display text-[1.15rem] font-semibold text-black">
            Doações
          </h2>

          <p className="m-0 flex-grow font-body text-sm text-ink-soft">
            Registre manualmente cada contribuição com os dados de contato do
            doador.
          </p>

          <button
            type="button"
            onClick={() => navegarPara("/dashboard/doacoes")}
            className="mt-2 inline-flex items-center justify-between gap-2 rounded-pill border border-black/15 bg-white px-4 py-3 font-body text-[13px] font-bold text-black transition-colors hover:bg-black/5 active:scale-[0.98]"
          >
            Abrir cadastro de doações
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </article>
      </section>

      {/* acao de rua */}
      <section className="flex flex-col gap-5 rounded-xl border border-black/10 bg-white p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="m-0 font-body text-xs font-bold uppercase tracking-wide text-gold">
              Agenda da rua
            </p>
            <h2 className="m-0 font-display text-[1.15rem] font-semibold text-black">
              Eventos e ações
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setFormularioAberto((aberto) => !aberto)}
            className="inline-flex items-center gap-1.5 rounded-pill border bg-black px-4 py-2.5 font-body text-[13px] font-bold text-white transition-colors hover:bg-black/80"
          >
            {formularioAberto ? (
              <>
                <X size={15} /> Fechar
              </>
            ) : (
              <>
                <Plus size={15} /> Criar evento
              </>
            )}
          </button>
        </div>

        {erroAgenda && (
          <p role="alert" className="m-0 font-body text-sm text-error">
            {erroAgenda}
          </p>
        )}

        {formularioAberto && (
          <form
            onSubmit={criarEvento}
            className="grid grid-cols-1 gap-4 rounded-lg border border-black/10 bg-parchment/40 p-6 md:grid-cols-2"
          >
            <label className="flex flex-col gap-1.5 font-body text-[13px] font-bold text-black">
              Nome do evento *
              <input
                required
                placeholder="Ex.: Mutirão de atendimento de rua"
                value={novoEvento.titulo}
                onChange={(e) =>
                  setNovoEvento({ ...novoEvento, titulo: e.target.value })
                }
                className="rounded-sm border border-black/[0.18] bg-white px-4 py-3 font-body text-sm font-normal text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-1"
              />
            </label>

            <label className="flex flex-col gap-1.5 font-body text-[13px] font-bold text-black">
              Data *
              <input
                required
                type="date"
                value={novoEvento.data}
                onChange={(e) =>
                  setNovoEvento({ ...novoEvento, data: e.target.value })
                }
                className="rounded-sm border border-black/[0.18] bg-white px-4 py-3 font-body text-sm font-normal text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-1"
              />
            </label>

            <label className="flex flex-col gap-1.5 font-body text-[13px] font-bold text-black">
              Local da ação
              <input
                placeholder="Ex.: Vila Industrial, Campinas"
                value={novoEvento.local}
                onChange={(e) =>
                  setNovoEvento({ ...novoEvento, local: e.target.value })
                }
                className="rounded-sm border border-black/[0.18] bg-white px-4 py-3 font-body text-sm font-normal text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-1"
              />
            </label>

            <label className="flex flex-col gap-1.5 font-body text-[13px] font-bold text-black md:col-span-2">
              Comentários / Descrição
              <textarea
                value={novoEvento.comentarios}
                onChange={(e) =>
                  setNovoEvento({ ...novoEvento, comentarios: e.target.value })
                }
                placeholder="Orientações para a equipe e descrição do evento"
                rows={3}
                className="resize-y rounded-sm border border-black/[0.18] bg-white px-4 py-3 font-body text-sm font-normal text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-1"
              />
            </label>

            <button
              type="submit"
              disabled={salvandoEvento}
              className="inline-flex w-fit justify-self-center items-center rounded-pill bg-black px-5 py-3 font-body text-[14px] font-bold text-parchment transition-opacity hover:opacity-90 md:col-span-2"
            >
              {salvandoEvento
                ? "Salvando..."
                : eventoEmEdicao
                  ? "Atualizar evento"
                  : "Salvar evento"}
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <EventCalendar
            events={eventos.map((evento) => ({
              id: evento.id,
              title: evento.titulo,
              date: evento.data,
              details: evento.comentarios || evento.description || "",
              meta: evento.local || "Campinas",
            }))}
          />

          <div className="flex flex-col gap-3">
            {eventosExibidos.map((evento) => {
              const dia = new Date(`${evento.data}T00:00:00`).getDate();

              return (
                <div
                  key={evento.id}
                  className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 md:flex-row"
                >
                  <div
                    aria-label={`Dia ${dia}`}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-black font-display text-lg font-bold text-parchment"
                  >
                    {dia}
                  </div>

                  <div className="flex flex-1 flex-col gap-1">
                    <strong className="font-body text-sm font-bold text-black">
                      {evento.titulo}
                    </strong>
                    <span className="font-body text-xs text-ink-soft">
                      {new Date(`${evento.data}T00:00:00`).toLocaleDateString(
                        "pt-BR",
                      )}{" "}
                      · {evento.local || "Campinas"}
                    </span>
                    <p className="m-0 font-body text-sm text-ink-soft">
                      {evento.comentarios ||
                        evento.description ||
                        "Sem comentários registrados."}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 border-t border-black/10 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setNovoEvento({
                            titulo: evento.titulo,
                            data: evento.data,
                            comentarios:
                              evento.comentarios || evento.description || "",
                            local: evento.local || "Centro de Campinas",
                          });
                          setEventoEmEdicao(evento.id);
                          setFormularioAberto(true);
                        }}
                        className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-pill border border-black/20 bg-white px-3 font-body text-[13px] font-bold text-black transition-colors hover:bg-black/5"
                      >
                        <Pencil size={14} className="shrink-0" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => excluirEvento(evento.id)}
                        className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-pill px-3 font-body text-[13px] font-bold text-error/70 transition-colors hover:bg-error/10 hover:text-error"
                      >
                        <Trash2 size={14} className="shrink-0" />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {eventos.length > EVENTOS_VISIVEIS_INICIALMENTE && (
              <button
                type="button"
                aria-expanded={mostrarTodosEventos}
                onClick={() => setMostrarTodosEventos((atual) => !atual)}
                className="inline-flex min-h-10 w-fit items-center gap-2 self-center rounded-pill border border-black/15 bg-white px-4 py-2 font-body text-sm font-bold text-black transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
              >
                {mostrarTodosEventos
                  ? "Ver menos eventos"
                  : `Ver mais eventos (${eventos.length - EVENTOS_VISIVEIS_INICIALMENTE})`}
                {mostrarTodosEventos ? (
                  <ChevronUp size={16} aria-hidden="true" />
                ) : (
                  <ChevronDown size={16} aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </div>
      </section>

    </main>
  );
}
