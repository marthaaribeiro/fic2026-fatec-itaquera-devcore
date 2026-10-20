import { useDashboardEventos } from "../../hooks/api/useDashboardEventos";
import { useMedicamentosStorage } from "../../hooks/storage/useMedicamentosStorage";
import { useDashboardColaboradorUI } from "../../hooks/ui/useDashboardColaboradorUI";
import { EventCalendar } from "../../components/EventCalendar/EventCalendar";
import { Kicker, Button, FormField } from "../../components";
import { LogoutButton } from "../../components/LogoutButton/LogoutButton";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { DashboardColaboradorData } from "../../types/dashboard";

const LIMITE_ACOES_VISIVEIS = 3;

function saudacaoPorHorario(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(dataIso: string): { dia: string; mes: string } {
  const data = new Date(`${dataIso}T00:00:00`);
  const dia = data.toLocaleDateString("pt-BR", { day: "2-digit" });
  const mes = data
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");
  return { dia, mes };
}

type StatTone = "neutro" | "atencao" | "critico" | "baixo";

const TONE_CARD_CLASSES: Record<StatTone, string> = {
  neutro: "bg-white border border-black/10",
  atencao: "bg-amber/10 border border-amber/25",
  critico: "bg-error/10 border border-error/25",
  baixo: "bg-gold/10 border border-gold/25",
};

const TONE_VALUE_CLASSES: Record<StatTone, string> = {
  neutro: "text-black",
  atencao: "text-black",
  critico: "text-error",
  baixo: "text-black",
};

function StatCard({
  tone,
  value,
  label,
}: {
  tone: StatTone;
  value: number | string;
  label: string;
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-2xl p-4 ${TONE_CARD_CLASSES[tone]}`}
    >
      <span
        className={`font-display text-xl font-semibold ${TONE_VALUE_CLASSES[tone]}`}
      >
        {value}
      </span>
      <span className="font-body text-[12px] leading-tight text-ink-soft">
        {label}
      </span>
    </div>
  );
}

interface DashboardColaboradorProps {
  dadosIniciais?: DashboardColaboradorData;
  usuario?: { nome: string; email: string } | null;
}

function SectionCard({
  id,
  title,
  children,
  className = "",
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={id}
      className={`flex flex-col rounded-2xl border border-black/10 bg-white p-4 sm:p-5 ${className}`}
    >
      <h2
        id={id}
        className="m-0 mb-3 font-display text-lg font-semibold text-black"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}



export default function DashboardColaborador({
  dadosIniciais,
  usuario,
}: DashboardColaboradorProps) {
  const { eventos: eventosCompartilhados, erroAgenda } = useDashboardEventos();
  const { medicamentos } = useMedicamentosStorage({
    loadFromApi: true,
    listenToAuthChange: true,
  });
  const {
    mostrarTodasAcoes,
    setMostrarTodasAcoes,
    estoqueAtualizado,
    setEstoqueAtualizado,
    salvandoEstoque,
    atualizarEstoque,
  } = useDashboardColaboradorUI();

  const totalMedicamentosEstoque = medicamentos.reduce(
    (acc, m) => acc + m.quantidade,
    0,
  );

  const hoje = new Date().toISOString().split("T")[0];
  const medicamentosVencidos = medicamentos.filter(
    (m) => m.vencido || m.validade < hoje,
  ).length;

  const medicamentosPertoVencer = medicamentos.filter((m) => {
    if (m.vencido || m.validade < hoje) return false;
    const diffDias = Math.ceil(
      (new Date(`${m.validade}T00:00:00`).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return diffDias >= 0 && diffDias <= 30;
  }).length;

  const medicamentosEstoqueBaixo = medicamentos.filter(
    (m) => m.quantidade > 0 && m.quantidade < 10,
  ).length;

  const acoesExibidas = mostrarTodasAcoes
    ? eventosCompartilhados
    : eventosCompartilhados.slice(0, LIMITE_ACOES_VISIVEIS);

  const doacoesValor = dadosIniciais?.doacoes.valorTotalMes ?? 4230.5;
  const doacoesQuantidade = dadosIniciais?.doacoes.quantidadeMes ?? 27;
  const nomeColaborador = usuario?.nome || "Colaborador(a)";

  function abrirDoacoes(evento: React.MouseEvent<HTMLAnchorElement>) {
    evento.preventDefault();
    window.history.pushState({}, "", "/dashboard/doacoes");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return (
    <div className="mx-auto flex max-w-[1120px] flex-col gap-6 px-6 py-8 md:px-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <Kicker>Painel do colaborador</Kicker>
          <h1 className="m-0 font-display text-[26px] font-semibold text-black md:text-[32px]">
            {saudacaoPorHorario()}, {nomeColaborador.split(" ")[0]}
          </h1>
        </div>
        <LogoutButton />
      </header>

      <SectionCard id="secao-estoque" title="Estoque de medicamentos">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                tone="neutro"
                value={totalMedicamentosEstoque || medicamentos.length}
                label="Unidades em estoque"
              />
              <StatCard
                tone="atencao"
                value={medicamentosPertoVencer}
                label="Perto de vencer"
              />
              <StatCard
                tone="critico"
                value={medicamentosVencidos}
                label="Vencidos"
              />
              <StatCard
                tone="baixo"
                value={medicamentosEstoqueBaixo}
                label="Estoque baixo"
              />
            </div>
            <form
              onSubmit={atualizarEstoque}
              className="mt-5 flex flex-wrap items-end gap-3 border-t border-black/10 pt-5"
            >
              <FormField
                id="estoque-total"
                label="Total de unidades em estoque"
                type="number"
                min={0}
                value={totalMedicamentosEstoque || estoqueAtualizado}
                onChange={(evento) =>
                  setEstoqueAtualizado(Number(evento.target.value))
                }
              />
              <Button type="submit" variant="dark">
                {salvandoEstoque ? "Salvando..." : "Atualizar estoque"}
              </Button>
            </form>
      </SectionCard>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(250px,0.9fr)]">
        <section
          aria-labelledby="secao-agenda-titulo"
          className="flex flex-col gap-5 rounded-2xl border border-black/10 bg-white p-4 sm:p-5"
        >
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="m-0 font-mono text-[11px] font-semibold uppercase tracking-wide text-gold">
                Agenda
              </p>
              <h2
                id="secao-agenda-titulo"
                className="m-0 font-display text-lg font-semibold text-black"
              >
                Eventos disponíveis
              </h2>
            </div>
            <span className="rounded-pill border border-gold bg-gold/5 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-gold">
              {eventosCompartilhados.length} {eventosCompartilhados.length === 1 ? "ação" : "ações"}
            </span>
          </header>

          {erroAgenda && (
            <p role="alert" className="m-0 font-body text-sm text-error">
              {erroAgenda}
            </p>
          )}

          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(230px,0.8fr)_minmax(0,1.2fr)]">
            <EventCalendar
              events={eventosCompartilhados.map((acao) => ({
                id: acao.id,
                title: acao.titulo,
                date: acao.data,
                meta: acao.local || "Campinas",
              }))}
            />

            <div className="flex flex-col gap-3">
              {eventosCompartilhados.length === 0 && (
                <p className="font-body text-sm text-ink-soft">
                  Nenhum evento disponível no momento.
                </p>
              )}
              {acoesExibidas.map((acao) => {
                const { dia, mes } = formatarData(acao.data);
                return (
                  <article
                    key={acao.id}
                    className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 bg-white p-3 transition hover:border-black/20"
                  >
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-volunteer-soft">
                      <strong className="font-display text-lg font-semibold leading-none text-volunteer">
                        {dia}
                      </strong>
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-volunteer">
                        {mes}
                      </span>
                    </div>
                    <div className="flex min-w-[140px] flex-1 flex-col gap-0.5">
                      <h3 className="m-0 font-display text-[15px] font-semibold text-black">
                        {acao.titulo}
                      </h3>
                      <p className="m-0 font-body text-xs text-ink-soft">
                        {acao.local || "Campinas"}
                      </p>
                    </div>
                  </article>
                );
              })}
              {eventosCompartilhados.length > LIMITE_ACOES_VISIVEIS && (
                <button
                  type="button"
                  aria-expanded={mostrarTodasAcoes}
                  onClick={() => setMostrarTodasAcoes((atual) => !atual)}
                  className="inline-flex min-h-10 w-fit items-center gap-2 self-center rounded-pill border border-black/15 bg-white px-4 py-2 font-body text-sm font-bold text-black transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                >
                  {mostrarTodasAcoes
                    ? "Ver menos ações"
                    : `Ver mais ações (${eventosCompartilhados.length - LIMITE_ACOES_VISIVEIS})`}
                  {mostrarTodasAcoes ? (
                    <ChevronUp size={16} aria-hidden="true" />
                  ) : (
                    <ChevronDown size={16} aria-hidden="true" />
                  )}
                </button>
              )}
            </div>
          </div>
        </section>

        <SectionCard
          id="secao-doacoes"
          title="Doações do mês"
          className="self-start lg:sticky lg:top-6"
        >
          <div className="grid grid-cols-1 gap-2 rounded-2xl bg-black p-5 ring-1 ring-white/5 lg:gap-3 lg:p-8">
            <div className="flex min-w-0 flex-col gap-1 border-r border-white/10 pr-4 lg:pr-6">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-gold">
                Arrecadado
              </span>
              <span className="font-display text-lg font-semibold text-parchment break-words sm:text-xl">
                {formatarMoeda(doacoesValor)}
              </span>
              <span className="font-body text-xs text-parchment/60">
                este mês
              </span>
            </div>
            <div className="flex min-w-0 flex-col gap-1 pl-1 lg:pl-2">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-gold">
                Doações
              </span>
              <span className="font-display text-lg font-semibold text-parchment sm:text-xl">
                {doacoesQuantidade}
              </span>
              <span className="font-body text-xs text-parchment/60">
                {doacoesQuantidade === 1 ? "recebida" : "recebidas"}
              </span>
            </div>
          </div>

          <a
            href="/dashboard/doacoes"
            onClick={abrirDoacoes}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-pill bg-amber px-5 py-2.5 font-body text-sm font-bold text-black transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            Ver gestão de doações
            <span aria-hidden="true">→</span>
          </a>
        </SectionCard>
      </div>

    </div>
  );
}
