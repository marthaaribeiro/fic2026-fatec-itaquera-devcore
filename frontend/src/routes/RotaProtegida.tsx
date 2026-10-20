import { Navigate, Outlet } from "react-router-dom";
import { obterSessaoUsuario } from "../lib/storage";
import { rotaInicial, type TipoUsuario } from "../types/auth";

export function RotaProtegida({ papeis }: { papeis: TipoUsuario[] }) {
	const sessao = obterSessaoUsuario();

	if (!sessao) return <Navigate to="/login" replace />;

	const tipo: TipoUsuario =
		sessao.tipo === "admin"
			? "adm"
			: sessao.tipo === "colaborador"
				? "func"
				: "voluntario";

	if (!papeis.includes(tipo)) return <Navigate to={rotaInicial[tipo]} replace />;

	return <Outlet />;
}