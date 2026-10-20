import Remedio from "../models/Remedio.js";
import RemedioUsuario from "../models/RemedioUsuario.js";
import connection from "../models/connection.js";
import dayjs from "dayjs";
import { Op } from "sequelize";

const getRemedioC = async (req, res) => {
  const { status } = req.query;
  const hoje = new Date();
  const where =
    status === "vencidos"
      ? { status: 1, data: { [Op.lt]: hoje } }
      : { status: 1, data: { [Op.gte]: hoje } };
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

const postRemedioC = async (req, res) => {
  try {
    const { id } = req.usuario;
    const { data, confirmarVencido, ...resto } = req.body;

    const dataVencimento = dayjs(data);

    if (!dataVencimento.isValid()) {
      return res.status(400).json({ mensagem: "Data inválida." });
    }

    const confirmado = confirmarVencido === true || confirmarVencido === "true";

    if (dataVencimento.isBefore(dayjs(), "day") && !confirmado) {
      return res.status(409).json({
        mensagem: "O remédio está vencido, deseja cadastrar mesmo assim?",
        requerConfirmacao: true,
      });
    }

    const dataFormatada = dataVencimento.format("YYYY-MM-DD");

    const existeRemedio = await Remedio.findOne({
      where: { nome: resto.nome, data: dataFormatada, status: 1 },
    });
    if (existeRemedio) {
      return res
        .status(409)
        .json({
          mensagem: "Esse remédio já foi cadastrado com essa validade!",
        });
    }

    await Remedio.create({
      ...resto,
      data: dataFormatada,
      user_add: id,
    });

    return res
      .status(201)
      .json({ mensagem: "Remédio cadastrado com sucesso!" });
  } catch (erro) {
    return res.status(500).json({
      mensagem:
        "Erro interno ao cadastrar remédio...Comunique-nos sobre o ocorrido",
      erro: erro.message,
    });
  }
};

const putRemedioC = async (req, res) => {
  try {
    const { id: idRemedio } = req.params;
    const { id: idColaborador } = req.usuario;

    const remedio = await Remedio.findByPk(idRemedio);
    if (!remedio) return res.status(404).json("Remédio não encontrado");

    await Remedio.update({ ...req.body }, { where: { id: idRemedio } });

    await RemedioUsuario.create({ idRemedio, idColaborador });
    return res.status(200).json({ mensagem: "Remédio alterado com sucesso!" });
  } catch (erro) {
    res.status(500).json({
      mensagem:
        "Erro interno ao atualizar remédio...Comunique-nos sobre o ocorrido",
      erro: erro.message,
    });
  }
};

const alterarRemedioQuantidadeC = async (req, res) => {
  try {
    const { quantidade } = req.body;
    const { id: idRemedio } = req.params;
    const { id: idColaborador } = req.usuario;

    if (quantidade < 0) {
      return res.status(400).json({
        mensagem:
          "A quantidade deve ser um número inteiro maior ou igual a zero.",
      });
    }

    const [linhasAfetadas] = await Remedio.update(
      { quantidade },
      { where: { id: idRemedio } },
    );

    if (linhasAfetadas === 0)
      return res.status(404).json("Remédio não encontrado");

    await RemedioUsuario.create({ idRemedio, idColaborador });

    return res
      .status(200)
      .json({ mensagem: "Quantidade alterada com sucesso!" });
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Erro interno ao alterar quantidade",
      erro: erro.message,
    });
  }
};

const deleteRemedioC = async (req, res) => {
  try {
    const { id: idRemedio } = req.params;
    const { id: idColaborador } = req.usuario;

    const remedio = await Remedio.findByPk(idRemedio);
    if (!remedio || remedio.status === 0) {
      return res.status(404).json({ mensagem: "Remédio não encontrado" });
    }

    await connection.transaction(async (t) => {
      const [linhasAfetadas] = await Remedio.update(
        { status: 0 },
        { where: { id: idRemedio }, transaction: t },
      );

      if (linhasAfetadas === 0) {
        return res.status(404).json("Nenhuma alteração feita no remédio");
      }

      await RemedioUsuario.create(
        { idRemedio, idColaborador },
        { transaction: t },
      );
    });

    return res.status(200).json({ mensagem: "Remédio deletado com sucesso!" });
  } catch (erro) {
    return res.status(500).json({
      mensagem:
        "Erro interno ao deletar remédio...Comunique-nos sobre o ocorrido",
      erro: erro.message,
    });
  }
};

export default {
  getRemedioC,
  postRemedioC,
  putRemedioC,
  alterarRemedioQuantidadeC,
  deleteRemedioC,
};
