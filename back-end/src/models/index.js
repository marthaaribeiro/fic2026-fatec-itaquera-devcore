import connection from "./connection.js";
import Evento from "./Evento.js";
import Remedio from "./Remedio.js";
import Usuario from "./Usuario.js";
import RemedioUsuario from "./RemedioUsuario.js";

Remedio.hasMany(RemedioUsuario, {foreignKey: "idRemedio"});
RemedioUsuario.belongsTo(Remedio, {foreignKey: "idRemedio"});

Usuario.hasMany(RemedioUsuario, {foreignKey: "idColaborador"});
RemedioUsuario.belongsTo(Usuario, {foreignKey: "idColaborador"});

export {connection, Evento, Remedio, Usuario, RemedioUsuario}