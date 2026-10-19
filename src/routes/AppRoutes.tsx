import { Navigate, Route, Routes } from "react-router-dom";
import DashboardColaborador from "../pages/DashboardColaborador/DashboardColaborador";
import DashboardMedicamentos from "../pages/DashboardMedicamentos/DashboardMedicamentos";
import DashboardDoacoes from "../pages/DashboardDoacoes/DashboardDoacoes";
import DashboardAdmin from "../pages/DashboardAdmin/DashboardAdmin";
import DashboardVoluntario from "../pages/DashboardVoluntario/DashboardVoluntario";
import Home from "../pages/Home/Home";
import LoginPage from "../pages/Login/LoginPage";
import Eventos from "../pages/Eventos/eventos";
import Sobre from "../pages/Sobre/sobre";
import Doacao from "../pages/Doacao/doacao";
import Contato from "../pages/Contato/contato";
import { RotaProtegida } from "./RotaProtegida";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/eventos" element={<Eventos />} />
      <Route path="/sobre" element={<Sobre />} />
      <Route path="/doacao" element={<Doacao />} />
      <Route path="/contato" element={<Contato />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RotaProtegida papeis={["adm"]} />}>
        <Route path="/dashboard/admin" element={<DashboardAdmin />} />
      </Route>
      <Route element={<RotaProtegida papeis={["adm", "func"]} />}>
        <Route
          path="/dashboard/colaborador"
          element={<DashboardColaborador />}
        />
        <Route
          path="/dashboard/medicamentos"
          element={<DashboardMedicamentos />}
        />
        <Route path="/dashboard/doacoes" element={<DashboardDoacoes />} />
      </Route>
      <Route element={<RotaProtegida papeis={["voluntario"]} />}>
        <Route
          path="/dashboard/voluntario"
          element={<DashboardVoluntario />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
