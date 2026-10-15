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
      allowNull: false,
      field: "telefone_usuario",
    },
    tipo: { type: DataTypes.STRING, allowNull: false, field: "tipo_usuario" },
    aniversario: { type: DataTypes.DATEONLY, field: "data_nasc" },
    sobre: { type: DataTypes.TEXT, field: "sobre_usuario" },
  },
  { tableName: "usuarios", timestamps: false },
);

export default Usuario;

// const getFuncM = async () => {

//   return funcionarios;
// };

// const postUserM = async (usuario) => {
//   const { nome, email, senha, end, cep, tel, tipo, aniversario, sobre } =
//     usuario;
//   const query = `INSERT INTO usuarios(nome_usuario,
//     email_usuario,
//     senha_usuario,
//     endereco_usuario,
//     CEP_usuario,
//     telefone_usuario,
//     tipo_usuario,
//     data_nasc,
//     sobre_usuario) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   const resposta = await connection.execute(query, [
//     nome,
//     email,
//     senha,
//     end,
//     cep,
//     tel,
//     tipo,
//     aniversario,
//     sobre,
//   ]);
//   // o aniversario deve ser string e ANO/MES/DIA
//   return resposta.insertId;
// };

// const buscarPorEmail = async (email) => {
//   const [usuario] = await connection.execute(
//     "SELECT * FROM usuarios WHERE email_usuario = ?",
//     [email],
//   );
//   return usuario[0];
// };

// const buscarPorEmailNome = async (email, nome) => {
//   const [usuario] = await connection.execute(
//     "SELECT * FROM usuarios WHERE email_usuario = ? OR nome_usuario = ?",
//     [email, nome],
//   );
//   return usuario[0];
// };

// const putFuncM = async (usuarioNovo, idFunc) => {
//   const { nome, email, senha, end, cep, tel, tipo } = usuarioNovo;
//   const query = `
//     UPDATE usuarios
//     SET nome_usuario = ?,
//         email_usuario = ?,
//         senha_usuario = ?,
//         endereco_usuario = ?,
//         CEP_usuario = ?,
//         telefone_usuario = ?,
//         tipo_usuario = ?
//     WHERE ID_usuario = ?
//   `;

//   const resposta = await connection.execute(query, [
//     nome,
//     email,
//     senha,
//     end,
//     cep,
//     tel,
//     tipo,
//     idFunc,
//   ]);

//   return resposta.affectedRows;
// };

// const deleteFuncM = async (idFuncionario) => {
//   const [resposta] = await connection.execute(
//     "UPDATE usuarios SET status = false WHERE ID_usuario = ?",
//     [idFuncionario],
//   );
//   return resposta.affectedRows;
// };

// export default {
//   postUserM,
//   buscarPorEmail,
//   buscarPorEmailNome,
//   getFuncM,
//   putFuncM,
//   deleteFuncM,
// };
