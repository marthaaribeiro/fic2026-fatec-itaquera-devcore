import { useState, type FormEvent } from "react";

export type StatusDoacao = "aprovada" | "pendente" | "recusada";

export interface Doacao {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  valor: number;
  data: string;
  status: StatusDoacao;
}

const DOACOES_INICIAIS: Doacao[] = [
  {
    id: 1,
    nome: "Ana Paula Mendes",
    email: "ana.mendes@email.com",
    telefone: "(19) 99123-4567",
    valor: 850,
    data: "2026-08-04",
    status: "aprovada",
  },
  {
    id: 2,
    nome: "Instituto Bem Viver",
    email: "contato@bemviver.org",
    telefone: "(19) 3234-1000",
    valor: 650,
    data: "2026-08-12",
    status: "aprovada",
  },
  {
    id: 3,
    nome: "Carlos Eduardo Lima",
    email: "carlos.lima@email.com",
    telefone: "(19) 99876-1122",
    valor: 500,
    data: "2026-08-18",
    status: "pendente",
  },
  {
    id: 4,
    nome: "Mariana Souza",
    email: "mariana.souza@email.com",
    telefone: "(19) 99221-8833",
    valor: 120,
    data: "2026-08-22",
    status: "pendente",
  },
  {
    id: 5,
    nome: "Rafael Nogueira",
    email: "rafael.nogueira@email.com",
    telefone: "(19) 99771-2244",
    valor: 300,
    data: "2026-08-25",
    status: "recusada",
  },
];

const FORMULARIO_VAZIO = {
  nome: "",
  email: "",
  telefone: "",
  valor: "",
  data: "",
};

export function useDashboardDoacoesUI() {
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [doacaoEmEdicao, setDoacaoEmEdicao] = useState<number | null>(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);
  const [doacoes, setDoacoes] = useState(DOACOES_INICIAIS);
  const [mesSelecionado, setMesSelecionado] = useState(7);
  const [aba, setAba] = useState<StatusDoacao>("aprovada");

  const doacoesDoMes = doacoes.filter(
    (doacao) => Number(doacao.data.slice(5, 7)) - 1 === mesSelecionado,
  );
  const aprovadas = doacoesDoMes.filter(
    (doacao) => doacao.status === "aprovada",
  );
  const pendentes = doacoesDoMes.filter(
    (doacao) => doacao.status === "pendente",
  );
  const recusadas = doacoesDoMes.filter(
    (doacao) => doacao.status === "recusada",
  );
  const exibidas =
    aba === "aprovada" ? aprovadas : aba === "pendente" ? pendentes : recusadas;
  const total = aprovadas.reduce((soma, doacao) => soma + doacao.valor, 0);
  const diasComDoacao = new Set(
    doacoesDoMes.map((doacao) => Number(doacao.data.slice(8, 10))),
  );

  function salvarDoacao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const registro = {
      nome: formulario.nome.trim(),
      email: formulario.email.trim(),
      telefone: formulario.telefone.trim(),
      valor: Number(formulario.valor),
      data: formulario.data,
      status: "pendente" as StatusDoacao,
    };
    if (doacaoEmEdicao) {
      setDoacoes((atuais) =>
        atuais.map((doacao) =>
          doacao.id === doacaoEmEdicao ? { ...doacao, ...registro } : doacao,
        ),
      );
    } else {
      setDoacoes((atuais) => [...atuais, { ...registro, id: Date.now() }]);
    }
    setFormulario(FORMULARIO_VAZIO);
    setDoacaoEmEdicao(null);
    setFormularioAberto(false);
  }

  function editarDoacao(doacao: Doacao) {
    setFormulario({
      nome: doacao.nome,
      email: doacao.email,
      telefone: doacao.telefone,
      valor: String(doacao.valor),
      data: doacao.data,
    });
    setDoacaoEmEdicao(doacao.id);
    setFormularioAberto(true);
  }

  function atualizarStatus(id: number, status: StatusDoacao) {
    setDoacoes((atuais) =>
      atuais.map((doacao) =>
        doacao.id === id ? { ...doacao, status } : doacao,
      ),
    );
  }

  function excluirDoacao(id: number) {
    setDoacoes((atuais) => atuais.filter((doacao) => doacao.id !== id));
  }

  return {
    formularioAberto,
    setFormularioAberto,
    doacaoEmEdicao,
    formulario,
    setFormulario,
    doacoes,
    setDoacoes,
    mesSelecionado,
    setMesSelecionado,
    aba,
    setAba,
    aprovadas,
    pendentes,
    recusadas,
    exibidas,
    total,
    diasComDoacao,
    salvarDoacao,
    editarDoacao,
    atualizarStatus,
    excluirDoacao,
  };
}
