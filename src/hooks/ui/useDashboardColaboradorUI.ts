import { useState, type FormEvent } from "react";

export function useDashboardColaboradorUI() {
  const [mostrarTodasAcoes, setMostrarTodasAcoes] = useState(false);
  const [estoqueAtualizado, setEstoqueAtualizado] = useState(0);
  const [salvandoEstoque, setSalvandoEstoque] = useState(false);

  function atualizarEstoque(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setSalvandoEstoque(true);
    window.setTimeout(() => setSalvandoEstoque(false), 400);
  }

  return {
    mostrarTodasAcoes,
    setMostrarTodasAcoes,
    estoqueAtualizado,
    setEstoqueAtualizado,
    salvandoEstoque,
    atualizarEstoque,
  };
}
