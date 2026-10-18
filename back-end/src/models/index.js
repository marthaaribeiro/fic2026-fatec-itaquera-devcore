import connection from "./connection.js";
import Evento from "./Evento.js";
import Remedio from "./Remedio.js";
import Usuario from "./Usuario.js";
import RemedioUsuario from "./RemedioUsuario.js";
import Funcionario from "./Funcionario.js";

Remedio.hasMany(RemedioUsuario, {foreignKey: "idRemedio"});
RemedioUsuario.belongsTo(Remedio, {foreignKey: "idRemedio"});

Usuario.hasMany(RemedioUsuario, {foreignKey: "idColaborador"});
RemedioUsuario.belongsTo(Usuario, {foreignKey: "idColaborador"});

Usuario.hasOne(Funcionario, { foreignKey: "ID_usuario" });
Funcionario.belongsTo(Usuario, {foreignKey: "ID_usuario"});

await connection.sync()

export {connection, Evento, Remedio, Usuario, RemedioUsuario, Funcionario}