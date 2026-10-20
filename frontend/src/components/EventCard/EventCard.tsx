import { DatePill } from "../DatePill/DatePill";

export interface EventCardProps {
  date: string;
  place: string;
  title: string;
  description: string;
  photoUrl: string;
  photoAlt: string;
}

/**
 * Card usado na Agenda completa (e futuramente na home). Layout horizontal
 * (foto à esquerda, conteúdo à direita), fundo claro — segue a regra do guia
 * de não repetir fundo preto em grade de cards. Hug height sempre.
 */
export function EventCard({
  date,
  place,
  title,
  description,
  photoUrl,
  photoAlt,
}: EventCardProps) {
  return (
    <article className="flex gap-4 rounded-2xl border border-black/[0.06] bg-white p-4 md:gap-6 md:p-6">
      <img
        src={photoUrl}
        alt={photoAlt}
        className="h-[104px] w-[104px] shrink-0 rounded-xl object-cover md:h-36 md:w-36"
      />
      <div className="flex min-w-0 flex-col items-start gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <DatePill label={date} />
          <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-amber">
            {place}
          </span>
        </div>
        <h3 className="m-0 font-display text-[18px] font-normal leading-snug text-black md:text-[22px]">
          {title}
        </h3>
        <p className="m-0 font-body text-[13.5px] leading-snug text-ink-soft md:text-[15px]">
          {description}
        </p>
      </div>
    </article>
  );
}
