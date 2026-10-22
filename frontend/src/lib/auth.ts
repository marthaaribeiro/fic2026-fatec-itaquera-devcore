export type PerfilSessao = "admin" | "colaborador" | "voluntario";

export function normalizarTipoUsuario(tipoRaw?: string): PerfilSessao {
  if (!tipoRaw) throw new Error("O perfil da conta não foi informado.");
  const tipo = tipoRaw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  if (tipo === "adm" || tipo === "admin" || tipo === "administrador") {
    return "admin";
  }
  if (tipo === "func" || tipo === "colaborador" || tipo === "funcionario") {
    return "colaborador";
  }
  if (tipo === "voluntario") return "voluntario";
  throw new Error("O servidor retornou um perfil de usuário inválido.");
}
