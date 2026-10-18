import express from "express";
const routes = express.Router();
import usuarioC from "./controllers/usuarioController.js";
import middleware from './middlewares/verificoesUsuario.js'
import eventoC from "./controllers/eventoController.js";
import remedioC from "./controllers/remedioController.js";

routes.post("/cadastro", usuarioC.cadastro);

routes.post("/login" ,usuarioC.login);

routes.get("/usuarios", middleware.verificaToken ,middleware.verificaAdm ,usuarioC.getUsuarios);
routes.post("/usuarios", middleware.verificaToken ,middleware.verificaAdm ,usuarioC.cadastro);
routes.put("/usuarios/:id", middleware.verificaToken, usuarioC.putUsuarioC);
routes.patch("/usuarios/:id", middleware.verificaToken ,middleware.verificaAdm ,usuarioC.alterarStatusFunc);

routes.get("/eventos", eventoC.getEvento);
routes.post("/eventos", middleware.verificaToken ,middleware.verificaAdm ,eventoC.postEventoC);
routes.put("/eventos/:id", middleware.verificaToken ,middleware.verificaAdmFunc ,eventoC.putEventoC);
routes.patch("/eventos/:id", middleware.verificaToken ,middleware.verificaAdm ,eventoC.alterarStatusEvento);

routes.get("/remedio", remedioC.getRemedioC);
// routes.post("/remedio", middleware.verificaToken ,middleware.verificaAdm , remedioC.postRemedioC);
// routes.put("/remedio/:id", middleware.verificaToken ,middleware.verificaAdm ,remedioC.putRemedioC);
// routes.put("/remedio/:id/quantidade", middleware.verificaToken ,middleware.verificaFunc ,remedioC.putRemedioQuantidadeC);
// routes.delete("/remedio/:id", middleware.verificaToken ,middleware.verificaAdm ,remedioC.deleteRemedioC);

export default routes;
