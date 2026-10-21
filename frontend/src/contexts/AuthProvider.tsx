// src/contexts/AuthProvider.tsx
import { useCallback, useEffect, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from './authContext';
import {
    limparSessaoUsuario,
    salvarSessaoAutenticada,
    tokenStorage,
} from '../lib/storage';
import type { LoginResposta } from '../types/auth';
import { buscarUsuarioAtual } from '../services/authService';
export function AuthProvider({ children }: { children: ReactNode }) {
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['me'],
        queryFn: buscarUsuarioAtual,
        enabled: !!tokenStorage.get(),
        retry: false,
    });
    const sair = useCallback(() => {
        limparSessaoUsuario();
        qc.clear();
        qc.setQueryData(['me'], null);
    }, [qc]);
    const entrar = useCallback((r: LoginResposta) => {
        const perfil =
            r.usuario.tipo === 'adm'
                ? 'admin'
                : r.usuario.tipo === 'func'
                    ? 'colaborador'
                    : 'voluntario';
        salvarSessaoAutenticada(r.token, {
          id: r.usuario.id,
          nome: r.usuario.nome,
          email: r.usuario.email,
          tipo: perfil,
        });
        window.dispatchEvent(new CustomEvent('ong_auth_change'));
        qc.setQueryData(['me'], r.usuario);
    }, [qc]);
    useEffect(() => {
        window.addEventListener('auth:expirou', sair);
        return () => window.removeEventListener('auth:expirou', sair);
    }, [sair]);
    return <AuthContext.Provider value={{ usuario: data ?? null, carregando: isLoading, entrar, sair }}>{children}</AuthContext.Provider>;
}