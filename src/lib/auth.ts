export type PerfilSessao = "admin" | "colaborador" | "voluntario";

export function normalizarTipoUsuario(tipoRaw?: string): PerfilSessao {
  if (!tipoRaw) return "voluntario";
  const tipo = tipoRaw.toLowerCase().trim();
  if (tipo === "adm" || tipo === "admin" || tipo === "administrador") {
    return "admin";
  }
  if (tipo === "func" || tipo === "colaborador" || tipo === "funcionario") {
    return "colaborador";
  }
  return "voluntario";
}
