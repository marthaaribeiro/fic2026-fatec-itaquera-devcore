// src/hooks/useAuthMutations.ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { autenticarUsuario, cadastrarUsuario } from '../../services/authService';
import { rotaInicial, type CadastroDados, type LoginResposta } from '../../types/auth';

export function useLogin() {
  const { entrar } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dados: { email: string; senha: string }): Promise<LoginResposta> =>
      autenticarUsuario(dados.email, dados.senha),
    onSuccess: (resposta) => {
      entrar(resposta);
      navigate(rotaInicial[resposta.usuario.tipo], { replace: true });
    },
  });
}

export function useCadastro() {
  return useMutation({
    mutationFn: (dados: CadastroDados) => cadastrarUsuario(dados),
  });
}