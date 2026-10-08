import { useEffect, useState } from "react";
import {
  obterEventos,
  buscarEventosApi,
  type EventoGlobal,
} from "../../services/eventService";
import {
  buscarMedicamentosApi,
  obterMedicamentosCache,
  type MedicamentoItem,
} from "../../services/remedioService";
import {
  obterSolicitacoes,
  type SolicitacaoAcesso,
} from "../../services/authService";
import { EventCalendar } from "../../components/EventCalendar/EventCalendar";
import { MessageBox } from "../../components/MessageBox/MessageBox";
import { MuralBoard } from "../../components/MuralBoard/MuralBoard";
import { Kicker, Button, FormField } from "../../components";
import type { UsuarioAutenticado } from "../../types/auth";
import type { DashboardColaboradorData } from "../../types/dashboard";
import { VolunteerList } from "../../components/VolunteerList/VolunteerList";
import { LogoutButton } from "../../components/LogoutButton/LogoutButton";
import { ChevronDown, ChevronUp } from "lucide-react";

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

interface DashboardColaboradorProps {
  dadosIniciais?: DashboardColaboradorData;
  usuario?: UsuarioAutenticado | null;
}

export default function DashboardColaborador({
  dadosIniciais,
  usuario,
}: DashboardColaboradorProps) {
  const [eventosCompartilhados, setEventosCompartilhados] = useState<
    EventoGlobal[]
  >([]);
  const [medicamentos, setMedicamentos] = useState<MedicamentoItem[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAcesso[]>([]);
  const [acaoInscritosAberta, setAcaoInscritosAberta] = useState<number | null>(
    null,
  );
  const [mostrarTodasAcoes, setMostrarTodasAcoes] = useState(false);
  const [estoqueAtualizado, setEstoqueAtualizado] = useState(0);
  const [salvandoEstoque, setSalvandoEstoque] = useState(false);

  useEffect(() => {
    // 1. Carrega dados de eventos e ações
    setEventosCompartilhados(obterEventos());
    buscarEventosApi()
      .then((evs) => {
        if (Array.isArray(evs) && evs.length > 0) {
          setEventosCompartilhados(evs);
        }
      })
      .catch(() => {});

    // 2. Carrega dados de medicamentos do banco de dados
    setMedicamentos(obterMedicamentosCache());
    buscarMedicamentosApi()
      .then((meds) => {
        if (Array.isArray(meds)) {
          setMedicamentos(meds);
        }
      })
      .catch(() => {});

    // 3. Carrega solicitações de usuários e voluntários
    setSolicitacoes(obterSolicitacoes());

    function atualizarTudo() {
      setEventosCompartilhados(obterEventos());
      setMedicamentos(obterMedicamentosCache());
      setSolicitacoes(obterSolicitacoes());
    }

    window.addEventListener("ong_eventos_atualizados", atualizarTudo);
    window.addEventListener("ong_medicamentos_atualizados", atualizarTudo);
    window.addEventListener("ong_solicitacoes_atualizadas", atualizarTudo);
    window.addEventListener("ong_auth_change", atualizarTudo);

    return () => {
      window.removeEventListener("ong_eventos_atualizados", atualizarTudo);
      window.removeEventListener("ong_medicamentos_atualizados", atualizarTudo);
      window.removeEventListener("ong_solicitacoes_atualizadas", atualizarTudo);
      window.removeEventListener("ong_auth_change", atualizarTudo);
    };
  }, []);

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

  const totalVoluntariosAtivos = solicitacoes.filter(
    (s) => s.tipo === "voluntario" && s.status === "aceito",
  ).length;

  const totalVoluntariosPendentes = solicitacoes.filter(
    (s) => s.tipo === "voluntario" && s.status === "pendente",
  ).length;

  const totalInscricoesProximasAcoes = eventosCompartilhados.reduce(
    (acc, ev) =>
      acc + (ev.inscritosDetalhes?.length || ev.voluntariosInscritos || 0),
    0,
  );
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

  function atualizarEstoque(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setSalvandoEstoque(true);
    window.setTimeout(() => setSalvandoEstoque(false), 400);
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

          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(230px,0.8fr)_minmax(0,1.2fr)]">
            <EventCalendar
              events={eventosCompartilhados.map((acao) => ({
                id: acao.id,
                title: acao.titulo,
                date: acao.data,
                meta: `${acao.local || "Campinas"} · ${acao.vagas || 6} vagas`,
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
                const inscritos = acao.inscritosDetalhes?.length || acao.voluntariosInscritos || 0;
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
                        {acao.local || "Campinas"} · {acao.vagas || 6} vagas
                      </p>
                      <span className="font-body text-xs text-ink-soft">
                        {inscritos} {inscritos === 1 ? "voluntário inscrito" : "voluntários inscritos"}
                      </span>
                    </div>
                    <div className="w-full">
                      <VolunteerList
                        inscritos={acao.inscritosDetalhes || []}
                        vagas={acao.vagas || 6}
                        aberto={
                          acaoInscritosAberta !== null &&
                          String(acaoInscritosAberta) === String(acao.id)
                        }
                        onToggle={() =>
                          setAcaoInscritosAberta((atual) =>
                            String(atual) === String(acao.id) ? null : acao.id,
                          )
                        }
                        somenteLeitura={true}
                        onRemover={() => {}}
                      />
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

      <SectionCard id="secao-voluntarios" title="Voluntários">
        <div className="grid grid-cols-1 divide-y divide-black/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex min-h-16 items-center justify-between gap-3 px-3 py-3 sm:px-5">
            <span className="font-body text-sm text-ink-soft">Ativos</span>
            <strong className="font-display text-xl font-semibold text-black">
              {totalVoluntariosAtivos}
            </strong>
          </div>
          <div className="flex min-h-16 items-center justify-between gap-3 px-3 py-3 sm:px-5">
            <span className="font-body text-sm text-ink-soft">
              Aguardando confirmação
            </span>
            <strong className="font-display text-xl font-semibold text-black">
              {totalVoluntariosPendentes}
            </strong>
          </div>
          <div className="flex min-h-16 items-center justify-between gap-3 px-3 py-3 sm:px-5">
            <span className="font-body text-sm text-ink-soft">
              Inscrições nas próximas ações
            </span>
            <strong className="font-display text-xl font-semibold text-black">
              {totalInscricoesProximasAcoes}
            </strong>
          </div>
        </div>
      </SectionCard>

      <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <MessageBox
          author="colaborador"
          usuarioNome={usuario?.nome || "Colaborador(a)"}
          usuarioEmail={usuario?.email || "colaborador@saudecampinas.org"}
        />
        <MuralBoard
          tipoUsuario="colaborador"
          usuarioNome={usuario?.nome || "Colaborador(a)"}
          usuarioEmail={usuario?.email || "colaborador@saudecampinas.org"}
        />
      </div>
    </div>
  );
}
