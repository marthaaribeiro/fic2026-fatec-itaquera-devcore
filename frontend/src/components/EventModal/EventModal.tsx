import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { DatePill } from "../DatePill/DatePill";
import { obterSessaoUsuario } from "../../lib/storage";
import type { EventoGlobal } from "../../types/event";
import type { SessaoUsuario } from "../../types/auth";

export interface EventModalProps {
  evento: EventoGlobal;
  fotoPadrao: string;
  onClose: () => void;
}

function formatarData(iso: string) {
  if (!iso || !iso.includes("-")) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function EventModal({ evento, fotoPadrao, onClose }: EventModalProps) {
  const [sessao, setSessao] = useState<SessaoUsuario | null>(() =>
    obterSessaoUsuario(),
  );
  const botaoFecharRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const atualizarSessao = () => setSessao(obterSessaoUsuario());
    window.addEventListener("ong_auth_change", atualizarSessao);
    return () => window.removeEventListener("ong_auth_change", atualizarSessao);
  }, []);

  useEffect(() => {
    botaoFecharRef.current?.focus();
    const aoPressionar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", aoPressionar);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoPressionar);
      document.body.style.overflow = overflowAnterior;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="evento-modal-titulo"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-t-2xl bg-parchment shadow-xl sm:rounded-2xl"
      >
        <button
          ref={botaoFecharRef}
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black"
        >
          <X size={18} />
        </button>

        <img
          src={evento.photoUrl || fotoPadrao}
          alt={evento.photoAlt || evento.titulo}
          className="h-48 w-full object-cover sm:h-56"
        />

        <div className="flex flex-col gap-3 p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <DatePill label={evento.data.split("-")[2] || "--"} />
            <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-amber">
              {evento.category || "Mutirão"} · {evento.local || "Campinas"}
            </span>
          </div>

          <h2
            id="evento-modal-titulo"
            className="m-0 font-display text-2xl font-normal leading-snug text-black"
          >
            {evento.titulo}
          </h2>

          <p className="m-0 font-body text-sm text-ink-soft">
            {formatarData(evento.data)}
            {typeof evento.vagas === "number" && evento.vagas > 0
              ? ` · ${evento.voluntariosInscritos ?? 0} de ${evento.vagas} vagas preenchidas`
              : ""}
          </p>

          <p className="m-0 font-body text-[15px] leading-relaxed text-ink-soft">
            {evento.description ||
              evento.comentarios ||
              "Ação do Projeto Saúde Campinas."}
          </p>

          <div className="mt-2 flex flex-col gap-3 border-t border-black/10 pt-4">
            <p role="status" className="m-0 font-body text-sm text-ink-soft">
              As inscrições para este evento ainda não estão disponíveis.
              {sessao?.tipo === "voluntario"
                ? " A equipe habilitará essa opção quando a integração de inscrições estiver pronta."
                : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
