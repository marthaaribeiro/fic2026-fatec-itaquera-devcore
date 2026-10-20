import { useState, type FormEvent } from "react";

interface PerfilVoluntario {
  nascimento: string;
  sobre: string;
  habilidades: string;
}

export function useDashboardVoluntarioUI() {
  const [perfil, setPerfil] = useState<PerfilVoluntario>({
    nascimento: "",
    sobre: "",
    habilidades: "",
  });
  const [editando, setEditando] = useState(false);

  function salvarPerfil(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEditando(false);
  }

  return { perfil, setPerfil, editando, setEditando, salvarPerfil };
}
