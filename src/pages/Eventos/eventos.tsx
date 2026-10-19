import { useMemo, useState, useEffect } from "react";
import "./eventos.css";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { Kicker } from "../../components/Kicker/Kicker";
import { EventCard } from "../../components/EventCard/EventCard";
import {
  buscarEventosApi,
} from "../../services/eventApiService";
import type { EventoGlobal } from "../../types/event";
import heroPlaceholder from "../../assets/hero.png";

const MESES = [
  "JANEIRO",
  "FEVEREIRO",
  "MARÇO",
  "ABRIL",
  "MAIO",
  "JUNHO",
  "JULHO",
  "AGOSTO",
  "SETEMBRO",
  "OUTUBRO",
  "NOVEMBRO",
  "DEZEMBRO",
];

function formatDay(iso: string) {
  if (!iso || !iso.includes("-")) return "15";
  return iso.split("-")[2];
}

function formatMesAno(iso: string) {
  if (!iso || !iso.includes("-")) return "2026";
  const [ano, mes] = iso.split("-");
  return `${MESES[Number(mes) - 1] || "MÊS"} ${ano}`;
}

function Eventos() {
  const [eventos, setEventos] = useState<EventoGlobal[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    buscarEventosApi()
      .then((dados) => {
        if (ativo) setEventos(dados);
      })
      .catch((error: unknown) => {
        if (ativo) {
          setErro(
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

  const grupos = useMemo(() => {
    const mapa = new Map<string, EventoGlobal[]>();
    for (const evento of eventos) {
      const chave = formatMesAno(evento.data);
      if (!mapa.has(chave)) mapa.set(chave, []);
      mapa.get(chave)!.push(evento);
    }
    return Array.from(mapa.entries());
  }, [eventos]);

  return (
    <>
      <Header
        logoUrl="/logo.png"
        navLinks={[
          { label: "Sobre", href: "/sobre" },
          { label: "Como ajudar", href: "/doacao" },
          { label: "Eventos", href: "/eventos" },
          { label: "Área do voluntário", href: "/voluntario" },
          { label: "Contato", href: "/contato" },
        ]}
      />

      <main className="eventos">
        <a href="/" className="eventos__back">
          ← Voltar para o início
        </a>

        <section className="eventos__intro">
          <Kicker color="amber">Agenda completa</Kicker>
          <h1 className="eventos__title">Todas as próximas ações.</h1>
          <p className="eventos__lead">
            Consulte as datas, os locais e as informações cadastradas pela equipe.
          </p>
        </section>

        {erro && <p role="alert" className="eventos__vazio">{erro}</p>}

        {grupos.map(([mesAno, eventosDoMes]) => (
          <section key={mesAno} className="eventos__grupo">
            <p className="eventos__mes">{mesAno}</p>
            <div className="eventos__cards">
              {eventosDoMes.map((evento) => (
                <EventCard
                  key={evento.id}
                  date={formatDay(evento.data)}
                  place={evento.local || "Campinas"}
                  title={evento.titulo}
                  description={
                    evento.description ||
                    evento.comentarios ||
                    "Ação do Projeto Saúde Campinas."
                  }
                  photoUrl={heroPlaceholder}
                  photoAlt={evento.titulo}
                />
              ))}
            </div>
          </section>
        ))}

        {grupos.length === 0 && (
          <p className="eventos__vazio">
            Nenhum evento cadastrado no momento.
          </p>
        )}
      </main>

      <Footer
        navLinks={[
          { label: "Sobre", href: "/sobre" },
          { label: "Como ajudar", href: "/doacao" },
          { label: "Eventos", href: "/eventos" },
          { label: "Área do voluntário", href: "/voluntario" },
          { label: "Contato", href: "/contato" },
        ]}
        email="contato@saudecampinas.org"
        whatsappLabel="(19) 99999-9999"
        instagramHandle="@saudecampinas"
        location="Campinas, SP"
      />
    </>
  );
}

export default Eventos;
