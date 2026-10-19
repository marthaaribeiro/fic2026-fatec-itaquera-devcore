import { api } from "../lib/api";
import type { DashboardColaboradorData } from "../types/dashboard";

export async function buscarDashboardColaborador(): Promise<DashboardColaboradorData> {
  const response = await api.get<DashboardColaboradorData>("/pagFunc");
  return response.data;
}
