export type TipoUsuario = "voluntario" | "colaborador" | "admin";

export interface PostagemMural {
  id: number;
  autorNome: string;
  autorEmail?: string;
  autorTipo: TipoUsuario;
  texto: string;
  criadaEm: string;
}
