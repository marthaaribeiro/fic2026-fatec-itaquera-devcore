// src/lib/api.ts
import axios, { AxiosError } from 'axios';
import { tokenStorage } from './storage';
export { tokenStorage } from './storage';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api' });
api.interceptors.request.use((config) => {
const token = tokenStorage.get();
if (token) config.headers.Authorization = `Bearer ${token}`;
return config;
});
api.interceptors.response.use(
(r) => r,
(err: AxiosError) => {
if (err.response?.status === 401 && tokenStorage.get()) {
tokenStorage.clear();
window.dispatchEvent(new Event('auth:expirou'));
}
return Promise.reject(err);
},
);
export type ErroApi = { mensagem: string; codigo?: string; erros?: Record<string, string[]> };
export function lerErro(err: unknown): ErroApi {
if (!axios.isAxiosError<ErroApi & { message?: string }>(err)) {
return { mensagem: err instanceof Error ? err.message : 'Erro inesperado.' };
}
const e = err as AxiosError<ErroApi & { message?: string }>;
if (!e.response) return { mensagem: 'Não foi possível conectar ao servidor.' };
const data = e.response.data;
if (!data) return { mensagem: 'Erro inesperado.' };
return {
...data,
mensagem: data.mensagem ?? data.message ?? 'Erro inesperado.',
};
}