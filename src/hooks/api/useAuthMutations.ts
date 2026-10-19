// src/hooks/useAuthMutations.ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/authContext';
import { rotaInicial, type CadastroDados, type LoginResposta } from '../../types/auth';
export function useLogin() {
const { entrar } = useAuth();
const navigate = useNavigate();
return useMutation({
mutationFn: async (dados: { email: string; senha: string }) =>
(await api.post<LoginResposta>('/auth/login', dados)).data,
onSuccess: (r) => { entrar(r); navigate(rotaInicial[r.usuario.tipo], { replace: true }); },
});
}
export function useCadastro() {
return useMutation({
mutationFn: async (dados: CadastroDados) =>
(await api.post<{ mensagem: string }>('/auth/cadastro', dados)).data,
});
}