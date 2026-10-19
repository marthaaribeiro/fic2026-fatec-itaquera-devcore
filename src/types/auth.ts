// src/types/auth.ts
// Tipos compartilhados entre o front (React) e o contrato esperado do back (Node + MySQL).

export type TipoUsuario = 'adm' | 'func' | 'voluntario';
export interface Usuario { id: number; nome: string; email: string; tipo: TipoUsuario }
export interface LoginResposta { token: string; usuario: Usuario }
export interface SessaoUsuario {
  id: number | string;
  nome: string;
  email: string;
  tipo: 'admin' | 'colaborador' | 'voluntario';
  token: string;
}
export interface CadastroDados {
nome: string; email: string; senha: string; tipo: 'func' | 'voluntario';
dataNasc: string; telefone?: string; endereco?: string; cep?: string; sobre?: string;
}
export interface Solicitacao extends Usuario {
telefone?: string; dataNasc?: string; sobre?: string;
statusCadastro: 'pendente' | 'aprovado' | 'rejeitado';
}
export const rotaInicial: Record<TipoUsuario, string> = {
adm: '/dashboard/admin', func: '/dashboard/colaborador', voluntario: '/dashboard/voluntario',
};