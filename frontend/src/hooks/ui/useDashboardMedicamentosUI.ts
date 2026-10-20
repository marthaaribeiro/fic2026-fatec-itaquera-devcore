import { useState, type FormEvent, type WheelEvent } from "react";
import { useMedicamentosStorage } from "../storage/useMedicamentosStorage";
import type { MedicamentoItem } from "../../types/medication";

export type MedicamentosProps = MedicamentoItem;

interface DashboardMedicamentosProps {
  medicamentosIniciais?: MedicamentosProps[];
}

interface FormularioMedicamento {
  nome: string;
  quantidade: string;
  veiculo: string;
  viaAdm: string;
  dose: string;
  validade: string;
}

interface MedicamentoAgrupado {
  nome: string;
  lotes: MedicamentosProps[];
}

interface LoteEmEdicao {
  nome: string;
  validade: string;
}

type Confirmacao =
  | {
      tipo: "editar";
      original: LoteEmEdicao;
      medicamento: MedicamentosProps;
    }
  | {
      tipo: "excluir";
      lote: LoteEmEdicao;
    };

const FORMULARIO_VAZIO: FormularioMedicamento = {
  nome: "",
  quantidade: "",
  veiculo: "",
  viaAdm: "",
  dose: "",
  validade: "",
};

function unidadePorVeiculo(veiculo: string): string {
  if (veiculo === "Líquido") return "mg/ml";
  if (veiculo === "Gotas") return "mg/gota";
  if (veiculo === "Pomada") return "mg/g";
  return "mg";
}

export function mensagemDeValidade(validade: string): string {
  const hoje = new Date();
  const dataValidade = new Date(`${validade}T00:00:00`);
  const inicioHoje = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate(),
  );
  const diferencaEmDias = Math.ceil(
    (dataValidade.getTime() - inicioHoje.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diferencaEmDias < 0)
    return `Vencido há ${Math.abs(diferencaEmDias)} dias`;
  if (diferencaEmDias === 0) return "Vence hoje";
  return `Vence em ${diferencaEmDias} dias`;
}

export function formatarDataMedicamento(validade: string): string {
  return new Date(`${validade}T00:00:00`).toLocaleDateString("pt-BR");
}

export function normalizarNomeMedicamento(nome: string): string {
  return nome.trim().toLocaleLowerCase("pt-BR");
}

function agruparMedicamentos(
  medicamentos: MedicamentosProps[],
): MedicamentoAgrupado[] {
  const grupos = new Map<string, MedicamentoAgrupado>();

  medicamentos.forEach((medicamento) => {
    const chaveNome = normalizarNomeMedicamento(medicamento.nome);
    const grupoAtual = grupos.get(chaveNome);

    if (!grupoAtual) {
      grupos.set(chaveNome, {
        nome: medicamento.nome,
        lotes: [{ ...medicamento }],
      });
      return;
    }

    const loteExistente = grupoAtual.lotes.find(
      (lote) => lote.validade === medicamento.validade,
    );

    if (loteExistente) {
      loteExistente.quantidade += medicamento.quantidade;
    } else {
      grupoAtual.lotes.push(medicamento);
    }
  });

  return Array.from(grupos.values());
}

export function statusValidade(
  validade: string,
): "vencido" | "proximo" | "ok" {
  const hoje = new Date();
  const dataValidade = new Date(`${validade}T00:00:00`);
  const inicioHoje = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate(),
  );
  const diferencaEmDias = Math.ceil(
    (dataValidade.getTime() - inicioHoje.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diferencaEmDias < 0) return "vencido";
  if (diferencaEmDias <= 30) return "proximo";
  return "ok";
}

export function useDashboardMedicamentosUI({
  medicamentosIniciais = [],
}: DashboardMedicamentosProps = {}) {
  const { medicamentos, setMedicamentos } = useMedicamentosStorage({
    initialItems: medicamentosIniciais,
    ignoreEmptyUpdates: true,
  });
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [formulario, setFormulario] =
    useState<FormularioMedicamento>(FORMULARIO_VAZIO);
  const [loteEmEdicao, setLoteEmEdicao] = useState<LoteEmEdicao | null>(null);
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null);
  const [medicamentoAdicionado, setMedicamentoAdicionado] = useState<
    string | null
  >(null);

  const medicamentosAgrupados = agruparMedicamentos(medicamentos);
  const quantidadeTotal = medicamentos.reduce(
    (total, medicamento) => total + medicamento.quantidade,
    0,
  );

  function atualizarCampo(campo: keyof FormularioMedicamento, valor: string) {
    setFormulario((estadoAtual) => ({ ...estadoAtual, [campo]: valor }));
  }

  function impedirAlteracaoPorScroll(evento: WheelEvent<HTMLInputElement>) {
    evento.currentTarget.blur();
  }

  function fecharFormulario() {
    setFormulario(FORMULARIO_VAZIO);
    setLoteEmEdicao(null);
    setFormularioAberto(false);
  }

  function criarMedicamento(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const novoMedicamento: MedicamentosProps = {
      nome: formulario.nome.trim(),
      quantidade: Number(formulario.quantidade),
      veiculo: formulario.veiculo.trim(),
      viaAdm: formulario.viaAdm.trim(),
      dose: Number(formulario.dose),
      unidadeDose: unidadePorVeiculo(formulario.veiculo),
      validade: formulario.validade,
    };

    if (loteEmEdicao) {
      setConfirmacao({
        tipo: "editar",
        original: loteEmEdicao,
        medicamento: novoMedicamento,
      });
      return;
    }

    setMedicamentos((listaAtual) => [...listaAtual, novoMedicamento]);
    setMedicamentoAdicionado(novoMedicamento.nome);
    fecharFormulario();
  }

  function editarLote(lote: MedicamentosProps) {
    setFormulario({
      nome: lote.nome,
      quantidade: String(lote.quantidade),
      veiculo: lote.veiculo,
      viaAdm: lote.viaAdm,
      dose: String(lote.dose),
      validade: lote.validade,
    });
    setLoteEmEdicao({ nome: lote.nome, validade: lote.validade });
    setFormularioAberto(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function solicitarExclusao(lote: MedicamentosProps) {
    setConfirmacao({
      tipo: "excluir",
      lote: { nome: lote.nome, validade: lote.validade },
    });
  }

  function confirmarAcao() {
    if (!confirmacao) return;

    if (confirmacao.tipo === "excluir") {
      setMedicamentos((listaAtual) =>
        listaAtual.filter(
          (medicamento) =>
            !(
              normalizarNomeMedicamento(medicamento.nome) ===
                normalizarNomeMedicamento(confirmacao.lote.nome) &&
              medicamento.validade === confirmacao.lote.validade
            ),
        ),
      );
    } else {
      setMedicamentos((listaAtual) => [
        ...listaAtual.filter(
          (medicamento) =>
            !(
              normalizarNomeMedicamento(medicamento.nome) ===
                normalizarNomeMedicamento(confirmacao.original.nome) &&
              medicamento.validade === confirmacao.original.validade
            ),
        ),
        confirmacao.medicamento,
      ]);
      fecharFormulario();
    }

    setConfirmacao(null);
  }

  return {
    medicamentos,
    medicamentosAgrupados,
    quantidadeTotal,
    formularioAberto,
    setFormularioAberto,
    formulario,
    atualizarCampo,
    impedirAlteracaoPorScroll,
    criarMedicamento,
    editarLote,
    solicitarExclusao,
    confirmacao,
    setConfirmacao,
    confirmarAcao,
    medicamentoAdicionado,
    setMedicamentoAdicionado,
    unidadePorVeiculo,
  };
}
