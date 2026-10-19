import { api } from "../lib/api";
import type { MedicamentoItem } from "../types/medication";
export type { MedicamentoItem } from "../types/medication";

const STORAGE_KEY_MEDICAMENTOS = "ong_medicamentos_cache";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizarMedicamento(
  raw: Record<string, unknown>,
): MedicamentoItem {
  const nome = String(raw.nome_remedio || raw.nome || "Medicamento sem nome");
  const quantidade = Number(raw.quantidade ?? 0);
  const veiculo = String(raw.apresentacao || raw.veiculo || "Comprimido");
  const viaAdm = String(raw.via_adm || raw.viaAdm || "Oral");
  const dose = Number(raw.dose ?? 500);
  const unidadeDose = String(raw.unidadeDose || "mg");
  const dataVal =
    raw.data_validade || raw.validade || new Date().toISOString().split("T")[0];
  const validade = String(dataVal).split("T")[0];

  const hoje = new Date().toISOString().split("T")[0];
  const estaVencido = Boolean(raw.vencido) || validade < hoje;

  return {
    id: raw.ID_remedio
      ? Number(raw.ID_remedio)
      : raw.id
        ? Number(raw.id)
        : undefined,
    nome,
    quantidade,
    veiculo,
    viaAdm,
    dose,
    unidadeDose,
    validade,
    lote: raw.lote ? String(raw.lote) : undefined,
    vencido: estaVencido,
  };
}

export async function buscarMedicamentosApi(): Promise<MedicamentoItem[]> {
  try {
    const { data } = await api.get<unknown>("/remedio");
    const listaRaw = Array.isArray(data)
      ? data
      : isRecord(data) && Array.isArray(data.mensagem)
        ? data.mensagem
        : [];

    const normalizados = listaRaw.map((item) => {
      if (!isRecord(item)) {
        throw new Error("A API retornou um medicamento em formato inválido.");
      }
      return normalizarMedicamento(item);
    });
    salvarMedicamentosCache(normalizados);
    return normalizados;
  } catch {
    return obterMedicamentosCache();
  }
}

export function obterMedicamentosCache(): MedicamentoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEDICAMENTOS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizarMedicamento);
      }
    }
    return [];
  } catch {
    return [];
  }
}

export function salvarMedicamentosCache(lista: MedicamentoItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MEDICAMENTOS, JSON.stringify(lista));
    window.dispatchEvent(new CustomEvent("ong_medicamentos_atualizados"));
  } catch (error) {
    console.error("Erro ao salvar cache de medicamentos:", error);
  }
}

/**
 * Deriva a lista de "faltando agora" a partir do estoque geral — não existe
 * (ainda) um campo de prioridade no back, então usamos como critério os
 * itens com MENOR quantidade em estoque (mais perto de acabar).
 * Ignora vencidos (esses são problema de descarte, não de falta) e limita
 * a `maximo` itens pra caber no card da página de Doação.
 */
export function itensFaltandoAgora(
  medicamentos: MedicamentoItem[],
  { limite = 15, maximo = 6 }: { limite?: number; maximo?: number } = {},
): MedicamentoItem[] {
  return medicamentos
    .filter((item) => !item.vencido && item.quantidade <= limite)
    .sort((a, b) => a.quantidade - b.quantidade)
    .slice(0, maximo);
}
