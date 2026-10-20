export interface EventoGlobal {
  id: number;
  titulo: string;
  data: string;
  comentarios: string;
  description: string;
  local: string;
}

export interface EventoServidor {
  ID_evento?: number | string;
  id_evento?: number | string;
  id?: number | string;
  nome_evento?: string;
  nome?: string;
  titulo?: string;
  data_evento?: string;
  data?: string;
  localizacao?: string;
  local?: string;
  desc_evento?: string;
  desc?: string;
  comentarios?: string;
  description?: string;
}
