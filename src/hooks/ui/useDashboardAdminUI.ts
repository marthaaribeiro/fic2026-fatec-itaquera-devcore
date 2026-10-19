import { useState } from "react";

export interface FormularioEvento {
  titulo: string;
  data: string;
  comentarios: string;
  local: string;
}

export function useDashboardAdminUI() {
  const [mostrarTodosEventos, setMostrarTodosEventos] = useState(false);
  const [novoEvento, setNovoEvento] = useState<FormularioEvento>({
    titulo: "",
    data: "",
    comentarios: "",
    local: "Centro de Campinas",
  });
  const [eventoEmEdicao, setEventoEmEdicao] = useState<number | null>(null);
  const [formularioAberto, setFormularioAberto] = useState(false);

  function limparFormulario() {
    setNovoEvento({
      titulo: "",
      data: "",
      comentarios: "",
      local: "Centro de Campinas",
    });
    setEventoEmEdicao(null);
    setFormularioAberto(false);
  }

  return {
    mostrarTodosEventos,
    setMostrarTodosEventos,
    novoEvento,
    setNovoEvento,
    eventoEmEdicao,
    setEventoEmEdicao,
    formularioAberto,
    setFormularioAberto,
    limparFormulario,
  };
}
