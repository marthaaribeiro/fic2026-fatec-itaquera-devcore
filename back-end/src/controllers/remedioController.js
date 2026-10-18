import Remedio from "../models/Remedio.js";
import {Op} from "sequelize";

const getRemedioC = async (req, res) => {
  const { status } = req.query;
  const hoje = new Date();
  const where = status === "vencidos" ? {data_validade: {[Op.lt]: hoje}} : {data_validade: {[Op.gte]: hoje}}
  try {
    const remedios = await Remedio.findAll({ where });

    return res.status(200).json(remedios);
  } catch (erro) {
    return res
      .status(500)
      .json(
        "Erro interno ao recuperar eventos...Comunique-nos sobre o ocorrido",
      );
  }
};

// const postRemedioC = async (req, res)=>{
//     await remedioModel.postRemedio({...req.body,user_add: req.usuario.id});
//     return res.status(200).json({mensagem: "Remédio cadastrado com sucesso!"});
// }

// const putRemedioC = async (req, res)=>{
//     const idRemedio = req.params.id;
//     const resposta = await remedioModel.putRemedio({...req.body, funcionario_id: req.usuario.id}, idRemedio);

//     if(resposta) return res.status(200).json({mensagem: "Remédio alterado com sucesso!"});

//     return res.json({mensagem: "Ocorreu um erro na alteração do remédio"});
// }

// const putRemedioQuantidadeC = async (req, res)=>{
//     const {quantidade} = req.body;
//     const idRemedio = req.params.id;
//     const idFunc = req.usuario.id;
//     if(quantidade < 0) return res.json({mensagem: "Valores negativos não são aceitos para quantidade de remédio"});

//     const resposta = await remedioModel.putQuantidadeRemedio(quantidade, idFunc, idRemedio);

//     if(resposta) return res.json({mensagem: "Quantidade mudada com sucesso"});

//     return res.json({mensagem: "Ocorreu um erro na alteração do remédio"});
// }

// const deleteRemedioC = async (req, res)=>{
//     const idRemedio = req.params.id;
//     await remedioModel.deleteRemedio(idRemedio);
//     return res.status(200).json({mensagem: "Remédio deletado com sucesso!"});
// }

export default { getRemedioC };
