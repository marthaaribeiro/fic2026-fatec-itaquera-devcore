export type PapelUsuario = "voluntario" | "colaborador" | "admin";

export interface ContatoDestino {
  id: string;
  nome: string;
  email: string;
  tipo: PapelUsuario | "grupo";
  descricao?: string;
}

export interface MensagemChat {
  id: number;
  canalId: string;
  remetenteNome: string;
  remetenteEmail: string;
  remetenteTipo: PapelUsuario;
  destinatarioNome: string;
  destinatarioEmail: string;
  destinatarioTipo: PapelUsuario | "grupo";
  texto: string;
  criadaEm: string;
}
