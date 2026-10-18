import { DataTypes } from "sequelize";
import connection from "./connection.js";

const Usuario = connection.define(
  "Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "ID_usuario",
    },
    nome: { type: DataTypes.STRING, allowNull: false, field: "nome_usuario" },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "email_usuario",
    },
    senha: { type: DataTypes.STRING, allowNull: false, field: "senha_usuario" },
    end: { type: DataTypes.STRING, field: "endereco_usuario" },
    cep: { type: DataTypes.STRING, field: "CEP_usuario" },
    tel: {
      type: DataTypes.STRING,
      field: "telefone_usuario",
    },
    tipo: { type: DataTypes.STRING, allowNull: false, field: "tipo_usuario" },
    aniversario: { type: DataTypes.DATEONLY, field: "data_nasc" },
    sobre: { type: DataTypes.TEXT, field: "sobre_usuario" },
    status: {type: DataTypes.BOOLEAN, field: "status_usuario"}
  },
  { tableName: "usuarios", timestamps: false },
);

export default Usuario;