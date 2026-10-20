import connection from "./connection.js";
import { DataTypes } from "sequelize";

const Funcionario = connection.define(
  "Funcionarios",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "ID_funcionario",
    },
    id_usuario: { type: DataTypes.INTEGER, field: "ID_usuario_fk" },
    cargo: { type: DataTypes.STRING, field: "cargo" },
    admissao: {
      type: DataTypes.DATE,
      field: "admissao",
      defaultValue: DataTypes.NOW,
    },
    status: { type: DataTypes.BOOLEAN, field: "status" },
  },
  { tableName: "funcionarios", timestamps: false },
);

export default Funcionario;
