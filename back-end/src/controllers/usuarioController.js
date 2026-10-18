import Usuario from "../models/Usuario.js";
import Funcionario from "../models/Funcionario.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import verificaIdade from "../utils/verificarIdade.js";
import connection from "../models/connection.js";

const getUsuarios = async (req, res) => {
  try {
    const { tipo } = req.query;

    const where = { status: "ativo" };
    if (tipo) where.tipo_usuario = tipo;

    const usuarios = await Usuario.findAll({
      where,
      attributes: { exclude: ["senha"] },
    });

    return res.status(200).json(usuarios);
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Erro interno ao recuperar usuários",
      erro: erro.message,
    });
  }
};

const cadastro = async (req, res) => {
  try {
    const {
      nome,
      email,
      senha,
      end,
      cep,
      tel,
      tipo,
      aniversario,
      sobre,
      cargo,
    } = req.body;

    const usuarioExiste = await Usuario.findOne({ where: { email } });
    if (usuarioExiste) {
      return res.status(400).json({ mensagem: "Usuário já cadastrado!" });
    }

    if (tipo === "func") {
      const idade = verificaIdade(aniversario);
      if (idade < 18) {
        return res
          .status(403)
          .json({ mensagem: "Você deve ser maior de idade para voluntariar!" });
      }
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await connection.transaction(async (t) => {
      const usuario = await Usuario.create(
        {
          nome,
          email,
          senha: senhaHash,
          end,
          cep,
          tel,
          tipo: tipo,
          aniversario,
          sobre,
        },
        { transaction: t },
      );

      if (tipo === "funcionário") {
        await Funcionario.create(
          { id_usuario: usuario.dataValues.id, cargo },
          { transaction: t },
        );
      }
      return usuario;
    });

    const token = jwt.sign(
      { id: novoUsuario.dataValues.id, tipo },
      process.env.ASSINATURA_TOKEN,
      { expiresIn: "8h" },
    );

    return res.status(201).json({
      mensagem: "Cadastro realizado com sucesso",
      token,
    });
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Ocorreu um erro interno durante o cadastro do usuário",
      erro: erro.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario)
      return res.status(401).json({ message: "Email ou senha incorretos!" });

    const confereSenha = await bcrypt.compare(senha, usuario.senha);

    if (!confereSenha)
      return res.status(401).json({ mensagem: "Email ou senha incorretos!" });

    if (usuario.status !== "ativo")
      return res.status(403).json({ mensagem: "Conta não está ativa." });

    const token = jwt.sign(
      { id: usuario.dataValues.id, tipo: usuario.dataValues.tipo },
      process.env.ASSINATURA_TOKEN,
      { expiresIn: "8h" },
    );

    return res.status(200).json({
      mensagem: "Login realizado com sucesso",
      token,
    });
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Erro interno ao realizar login.",
      erro: erro.message,
    });
  }
};

//logout é feito no front apagando o token

const putUsuarioC = async (req, res) => {
  const idU = Number(req.params.id);
  const { id, tipo } = req.usuario;

  try {
    if (id !== idU && tipo !== "admin") {
      return res.status(403).json({ mensagem: "Sem permissão" });
    }

    const {
      nome,
      email,
      senha,
      end,
      cep,
      tel,
      aniversario,
      sobre,
      cargo,
      status,
    } = req.body;

    const usuario = await Usuario.findByPk(idU);
    if (!usuario) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    const dados = { nome, email, end, cep, tel, aniversario, sobre };
    if (senha) {
      dados.senha = await bcrypt.hash(senha, 10);
    }

    await connection.transaction(async (t) => {
      await usuario.update(dados, { transaction: t });

      if (tipo === "admin") {
        const funcionario = await Funcionario.findOne({
          where: { id_usuario: idU },
          transaction: t,
        });
        if (funcionario) {
          await funcionario.update({ cargo, status }, { transaction: t });
        }
      }
    });

    return res.status(200).json({ mensagem: "Atualizado com sucesso" });
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Erro interno ao atualizar usuário",
      erro: erro.message,
    });
  }
};

const alterarStatusFunc = async (req, res) => {
  const { id } = req.params;
  try {
    await connection.transaction(async (t) => {
      const funcionario = await Funcionario.findByPk(id);

      if (!funcionario)
        return res
          .status(404)
          .json({ mensagem: "Funcionário não encontrado." });

      const usuario = await Usuario.findByPk(funcionario.id_usuario, {
        transaction: t,
      });

      const novoStatus = usuario.status === "ativo" ? "desativado" : "ativo";

      await funcionario.update({ status: novoStatus }, { transaction: t });
      await usuario.update({ status: novoStatus }, { transaction: t });
    });

    return res.status(200).json({
      mensagem: "Status do funcionário alterado com sucesso!",
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: "Erro ao alterar status do funcionário",
      erro: error.message,
    });
  }
};

export default {
  getUsuarios,
  cadastro,
  login,
  putUsuarioC,
  alterarStatusFunc,
};
