import { DataTypes } from "sequelize";
import connection from "./connection.js";

const Remedio = connection.define(
  "Remedio",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "ID_remedio",
    },
    nome: { type: DataTypes.STRING, field: "nome_remedio" },
    apresentacao: { type: DataTypes.STRING, allowNull: false },
    quantidade: DataTypes.INTEGER,
    data: { type: DataTypes.DATEONLY, field: "data_validade" },
    lote: DataTypes.STRING,
    armazenamento: { type: DataTypes.STRING, field: "local_armazenamento" },
    user_add: { type: DataTypes.INTEGER, field: "usuario_adicionou" },
    status: {type: DataTypes.BOOLEAN, field: "status"}
  },
  { tableName: "remedio", timestamps: false },
);

export default Remedio;