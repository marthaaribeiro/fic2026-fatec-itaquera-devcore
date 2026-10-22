// src/types/auth.ts
export type TipoUsuario = 'adm' | 'func' | 'voluntario' | 'admin' | 'colaborador';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: TipoUsuario;
}

export interface LoginRespostasServidor {
  mensagem?: string;
  token: string;
  usuario?: Usuario;
}

export interface LoginRespostasFrontend {
  token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    tipo: 'admin' | 'colaborador' | 'voluntario';
  };
}

export interface SessaoUsuario {
  id: number | string;
  nome: string;
  email: string;
  tipo: 'admin' | 'colaborador' | 'voluntario';
  token: string;
}

export interface CadastroDados {
  nome: string;
  email: string;
  senha: string;
  tipo: string;
  aniversario?: string;
  tel?: string;
  end?: string;
  cep?: string;
  sobre?: string;
  cargo?: string;
}

export const rotaInicial: Record<'admin' | 'colaborador' | 'voluntario', string> = {
  admin: '/dashboard/admin',
  colaborador: '/dashboard/colaborador',
  voluntario: '/dashboard/voluntario',
};