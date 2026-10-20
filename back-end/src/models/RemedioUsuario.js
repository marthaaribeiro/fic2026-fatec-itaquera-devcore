import { DataTypes } from "sequelize";
import connection from "./connection.js";

const RemedioUsuario = connection.define(
  "RemedioUsuario",
  {
    idAlteracao: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: true,
      field: "ID_alteracao",
    },
    idRemedio: { type: DataTypes.INTEGER, field: "ID_remedio" },
    idColaborador: { type: DataTypes.INTEGER, field: "ID_colaborador" },
    dataAlteracao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "data_alteracao",
    },
  },
  { tableName: "remedio_usuario", timestamps: false },
);

export default RemedioUsuario;
