import { DataTypes } from "sequelize";
import connection from "./connection.js";

const Evento = connection.define(
  "Evento",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "ID_evento",
    },
    nome: {
      type: DataTypes.STRING(180),
      allowNull: false,
      field: "nome_evento",
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "data_evento",
    },
    localizacao: {
      type: DataTypes.STRING(180),
      allowNull: false,
      field: "localizacao",
    },
    desc: { type: DataTypes.STRING(250), field: "desc_evento" },
    status: { type: DataTypes.BOOLEAN, field: "status" },
    inicio: { type: DataTypes.TIME, field: "horario_inicio", allowNull: false },
    final: { type: DataTypes.TIME, field: "horario_final", allowNull: false },
    idUser: {
      type: DataTypes.INTEGER,
      field: "adm_publicou",
      allowNull: false,
    },
  },
  { tableName: "evento", timestamps: false },
);

export default Evento;
