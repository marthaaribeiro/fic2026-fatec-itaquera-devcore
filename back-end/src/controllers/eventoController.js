import Evento from "../models/Evento.js";
import dayjs from "dayjs";

const getEvento = async (_req, res) => {
  try {
    const eventos = await Evento.findAll({ where: { status: true } });
    return res.status(200).json(eventos);
  } catch (erro) {
    return res.status(500).json({
      mensagem:
        "Erro interno ao cadastrar evento...Comunique-nos sobre o ocorrido",
      erro: erro.message,
    });
  }
};

const postEventoC = async (req, res) => {
  const { id: idUser } = req.usuario;
  const { nome, data, localizacao, desc, inicio, final } = req.body;
  try {
    const existeEvento = await Evento.findOne({
      where: { nome, data_evento: data },
    });
    if (existeEvento) {
      return res
        .status(409)
        .json({ mensagem: "Esse evento já foi cadastrado!" });
    }

    const dataUsuario = dayjs(data);

    if (!dataUsuario.isValid()) {
      return res.status(400).json({ mensagem: "Data inválida." });
    }

    if (dataUsuario.isBefore(dayjs(), "day")) {
      return res
        .status(400)
        .json({ mensagem: "A data inserida deve ser posterior a atual" });
    }

    console.log(data);

    await Evento.create({
      nome,
      data,
      localizacao,
      desc,
      inicio,
      final,
      idUser,
    });

    return res.status(201).json("Evento cadastrado com sucesso!");
  } catch (erro) {
    return res.status(500).json({
      mensagem:
        "Erro interno ao cadastrar evento...Comunique-nos sobre o ocorrido",
      erro: erro.message,
    });
  }
};

const putEventoC = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, data, localizacao, desc, inicio, final } = req.body;
    const [linhasAfetadas] = await Evento.update(
      { nome, data, localizacao, desc, inicio, final },
      { where: { id } },
    );

    if (linhasAfetadas.length === 0) {
      return res.status(404).json({ mensagem: "Evento não encontrado." });
    }

    return res.status(200).json({ mensagem: "Evento alterado com sucesso!" });
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro interno ao atualizar o evento",
      erro: error.message,
    });
  }
};

// caso o adm queira cancelar ou ativar um evento novamente
const alterarStatusEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const evento = await Evento.findByPk(id);
    if (!evento) {
      return res.status(404).json({ mensagem: "Evento não encontrado" });
    }

    const novoStatus = evento.status == 1 ? 0 : 1;
    const [linhasAfetadas] = await Evento.update(
      { status: novoStatus },
      { where: { id } },
    );

    if (linhasAfetadas.length === 0) {
      return res
        .status(404)
        .json({ mensagem: "Erro ao alterar status do evento." });
    }
    return res.status(200).json({ mensagem: "Status alterado com sucesso!" });
  } catch (error) {
    return res
      .status(500)
      .json({
        mensagem: "Erro interno ao alterar status evento.",
        erro: error.message,
      });
  }
};

export default { getEvento, postEventoC, putEventoC, alterarStatusEvento };
