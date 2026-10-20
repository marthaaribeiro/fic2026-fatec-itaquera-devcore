export interface MedicamentoItem {
  id?: number;
  nome: string;
  quantidade: number;
  veiculo: string;
  viaAdm: string;
  dose: number;
  unidadeDose: string;
  validade: string;
  lote?: string;
  vencido?: boolean;
}
