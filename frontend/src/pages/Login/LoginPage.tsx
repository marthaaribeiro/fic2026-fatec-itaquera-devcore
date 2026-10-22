import { useState } from "react";
import { useAuth } from "../../contexts/authContext";
import { obterEConsumirAlertaSeguranca } from "../../lib/storage";
import { autenticarUsuario, cadastrarUsuario } from "../../services/authService";
import { rotaInicial } from "../../types/auth";

type ViewMode = "login" | "cadastro" | "recuperar";
type TipoPerfil = "voluntario" | "funcionário";
const INPUT_CLASS =
  "w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 font-body text-sm text-black placeholder:text-ink-soft/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold";
const LABEL_CLASS =
  "flex flex-col gap-1.5 font-body text-sm font-bold text-black";

export default function LoginPage() {
  const { entrar } = useAuth();
  const [modo, setModo] = useState<ViewMode>("login");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<{
    tipo: "sucesso" | "erro" | "info";
    texto: string;
  } | null>(() => {
    const alerta = obterEConsumirAlertaSeguranca();
    return alerta ? { tipo: "erro", texto: alerta } : null;
  });

  const [login, setLogin] = useState({ email: "", senha: "" });
  const [cadastro, setCadastro] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    telefone: "",
    end: "",
    cep: "",
    tipo: "voluntario" as TipoPerfil,
    aniversario: "",
    sobre: "",
  });
  const [recuperar, setRecuperar] = useState({ email: "" });

  const validarEmail = (valor: string) => /\S+@\S+\.\S+/.test(valor);

  const enviarLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const emailNormalizado = login.email.trim().toLowerCase();

    if (!emailNormalizado || !login.senha) {
      setMensagem({
        tipo: "erro",
        texto: "Informe o e-mail e a senha para entrar.",
      });
      return;
    }

    if (!validarEmail(emailNormalizado)) {
      setMensagem({ tipo: "erro", texto: "O e-mail informado não é válido." });
      return;
    }

    setCarregando(true);
    setMensagem(null);
    try {
      const resposta = await autenticarUsuario(emailNormalizado, login.senha);
      entrar(resposta);

      setMensagem({
        tipo: "sucesso",
        texto: "Acesso realizado com sucesso! Redirecionando...",
      });
      window.setTimeout(() => {
        window.history.pushState({}, "", rotaInicial[resposta.usuario.tipo]);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }, 300);
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto:
          error instanceof Error
            ? error.message
            : "Não foi possível conectar ao servidor.",
      });
    } finally {
      setCarregando(false);
    }
  };

  const enviarCadastro = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !cadastro.nome.trim() ||
      !cadastro.email.trim() ||
      !cadastro.senha ||
      !cadastro.telefone.trim()
    ) {
      setMensagem({
        tipo: "erro",
        texto:
          "Preencha nome, e-mail, senha e telefone para concluir o cadastro.",
      });
      return;
    }

    if (!validarEmail(cadastro.email.trim())) {
      setMensagem({ tipo: "erro", texto: "Digite um e-mail válido." });
      return;
    }

    if (cadastro.senha.length < 6) {
      setMensagem({
        tipo: "erro",
        texto: "A senha precisa ter pelo menos 6 caracteres.",
      });
      return;
    }

    if (cadastro.senha !== cadastro.confirmarSenha) {
      setMensagem({ tipo: "erro", texto: "As senhas não conferem." });
      return;
    }

    setCarregando(true);
    setMensagem(null);
    try {
      const resultado = await cadastrarUsuario({
        nome: cadastro.nome.trim(),
        email: cadastro.email.trim().toLowerCase(),
        senha: cadastro.senha,
        tipo: cadastro.tipo,
        aniversario: cadastro.aniversario,
        tel: cadastro.telefone.trim(),
        end: cadastro.end.trim(),
        cep: cadastro.cep.trim(),
        sobre: cadastro.sobre.trim(),
        cargo: cadastro.tipo === "funcionário" ? "Equipe de Apoio" : undefined,
      });

      setMensagem({
        tipo: "sucesso",
        texto: resultado.mensagem || "Cadastro realizado. Faça login para entrar.",
      });
      setModo("login");
      setLogin({ email: cadastro.email.trim(), senha: "" });
      setCadastro({
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
        telefone: "",
        end: "",
        cep: "",
        tipo: "voluntario",
        aniversario: "",
        sobre: "",
      });
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto:
          error instanceof Error
            ? error.message
            : "Não foi possível conectar ao servidor.",
      });
    } finally {
      setCarregando(false);
    }
  };

  const enviarRecuperacao = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!recuperar.email.trim()) {
      setMensagem({
        tipo: "erro",
        texto: "Informe o e-mail para receber ajuda de acesso.",
      });
      return;
    }

    if (!validarEmail(recuperar.email.trim())) {
      setMensagem({ tipo: "erro", texto: "Digite um e-mail válido." });
      return;
    }

    setCarregando(true);
    setMensagem({
      tipo: "info",
      texto:
        "Se esse e-mail estiver cadastrado, a equipe enviará orientações de recuperação.",
    });
    setCarregando(false);
    setRecuperar({ email: "" });
    setModo("login");
  };

  const mensagemClasses = {
    sucesso: "bg-volunteer-soft text-volunteer",
    erro: "bg-error/10 text-error",
    info: "bg-gold/10 text-[#8a5620]",
  } as const;

  return (
    <main className="flex min-h-screen items-center justify-center bg-parchment px-4 py-10 sm:px-6">
      <div
        aria-live="polite"
        className={`w-full rounded-2xl border border-black/10 bg-white p-6 sm:p-8 lg:p-12 ${
          modo === "cadastro"
            ? "max-w-[750px] lg:max-w-[880px]"
            : "max-w-[440px] lg:max-w-[520px]"
        }`}
      >
        <div className="mb-6 flex flex-col gap-1.5 text-center">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-gold">
            Projeto Social Saúde Campinas
          </span>
          <h1 className="m-0 font-display text-2xl font-semibold text-black sm:text-[28px]">
            Área de acesso
          </h1>
          <p className="m-0 font-body text-sm text-ink-soft">
            Acesso para voluntários, colaboradores e equipe da ONG.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Opções de acesso"
          className="mb-6 flex gap-1 rounded-pill bg-black/5 p-1"
        >
          {[
            { id: "login", label: "Login" },
            { id: "cadastro", label: "Cadastro" },
            { id: "recuperar", label: "Recuperar" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={modo === item.id}
              onClick={() => {
                setModo(item.id as ViewMode);
                setMensagem(null);
              }}
              className={`min-h-9 flex-1 rounded-pill px-2 font-body text-[13px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                modo === item.id
                  ? "bg-black text-white"
                  : "text-ink-soft hover:bg-black/5 hover:text-black"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {mensagem && (
          <div
            role={mensagem.tipo === "erro" ? "alert" : "status"}
            className={`mb-5 rounded-xl px-4 py-3 font-body text-sm ${mensagemClasses[mensagem.tipo]}`}
          >
            {mensagem.texto}
          </div>
        )}

        {modo === "login" && (
          <form className="flex flex-col gap-4" onSubmit={enviarLogin}>
            <label className={LABEL_CLASS}>
              E-mail
              <input
                type="email"
                autoComplete="email"
                value={login.email}
                onChange={(event) =>
                  setLogin({ ...login, email: event.target.value })
                }
                placeholder="seu@email.com"
                required
                className={INPUT_CLASS}
              />
            </label>

            <label className={LABEL_CLASS}>
              Senha
              <input
                type="password"
                autoComplete="current-password"
                value={login.senha}
                onChange={(event) =>
                  setLogin({ ...login, senha: event.target.value })
                }
                placeholder="••••••••"
                required
                className={INPUT_CLASS}
              />
            </label>

            <button
              type="submit"
              disabled={carregando}
              className="mt-2 flex min-h-11 w-full items-center justify-center rounded-pill bg-black font-body text-sm font-bold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        )}

        {modo === "cadastro" && (
          <form className="flex flex-col gap-4" onSubmit={enviarCadastro}>
            <label className={LABEL_CLASS}>
              Nome completo *
              <input
                type="text"
                autoComplete="name"
                value={cadastro.nome}
                onChange={(event) =>
                  setCadastro({ ...cadastro, nome: event.target.value })
                }
                placeholder="Seu nome completo"
                required
                className={INPUT_CLASS}
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className={LABEL_CLASS}>
                E-mail *
                <input
                  type="email"
                  autoComplete="email"
                  value={cadastro.email}
                  onChange={(event) =>
                    setCadastro({ ...cadastro, email: event.target.value })
                  }
                  placeholder="seu@email.com"
                  required
                  className={INPUT_CLASS}
                />
              </label>

              <label className={LABEL_CLASS}>
                Telefone *
                <input
                  type="tel"
                  autoComplete="tel"
                  value={cadastro.telefone}
                  onChange={(event) =>
                    setCadastro({ ...cadastro, telefone: event.target.value })
                  }
                  placeholder="(19) 99999-9999"
                  required
                  className={INPUT_CLASS}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className={LABEL_CLASS}>
                Tipo de perfil *
                <select
                  value={cadastro.tipo}
                  onChange={(event) =>
                    setCadastro({
                      ...cadastro,
                      tipo: event.target.value as TipoPerfil,
                    })
                  }
                  className={INPUT_CLASS}
                >
                  <option value="voluntario">Voluntário(a)</option>
                  <option value="funcionário">Colaborador(a) / Funcionário(a)</option>
                </select>
              </label>

              <label className={LABEL_CLASS}>
                Data de nascimento
                <input
                  type="date"
                  value={cadastro.aniversario}
                  onChange={(event) =>
                    setCadastro({
                      ...cadastro,
                      aniversario: event.target.value,
                    })
                  }
                  className={INPUT_CLASS}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className={LABEL_CLASS}>
                Senha *
                <input
                  type="password"
                  autoComplete="new-password"
                  value={cadastro.senha}
                  onChange={(event) =>
                    setCadastro({ ...cadastro, senha: event.target.value })
                  }
                  placeholder="Mínimo 6 caracteres"
                  required
                  className={INPUT_CLASS}
                />
              </label>

              <label className={LABEL_CLASS}>
                Confirmar senha *
                <input
                  type="password"
                  autoComplete="new-password"
                  value={cadastro.confirmarSenha}
                  onChange={(event) =>
                    setCadastro({
                      ...cadastro,
                      confirmarSenha: event.target.value,
                    })
                  }
                  placeholder="Repita a senha"
                  required
                  className={INPUT_CLASS}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className={LABEL_CLASS}>
                Endereço
                <input
                  type="text"
                  autoComplete="street-address"
                  value={cadastro.end}
                  onChange={(event) =>
                    setCadastro({ ...cadastro, end: event.target.value })
                  }
                  placeholder="Rua, número e bairro"
                  className={INPUT_CLASS}
                />
              </label>

              <label className={LABEL_CLASS}>
                CEP
                <input
                  type="text"
                  autoComplete="postal-code"
                  value={cadastro.cep}
                  onChange={(event) =>
                    setCadastro({ ...cadastro, cep: event.target.value })
                  }
                  placeholder="13000-000"
                  className={INPUT_CLASS}
                />
              </label>
            </div>

            <label className={LABEL_CLASS}>
              Sobre você
              <textarea
                value={cadastro.sobre}
                onChange={(event) =>
                  setCadastro({ ...cadastro, sobre: event.target.value })
                }
                placeholder="Conte um pouco sobre sua disponibilidade ou interesse na ONG"
                rows={4}
                className={INPUT_CLASS}
              />
            </label>

            <button
              type="submit"
              disabled={carregando}
              className="mt-2 flex min-h-11 w-full items-center justify-center rounded-pill bg-amber font-body text-sm font-bold text-black transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {carregando ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>
        )}

        {modo === "recuperar" && (
          <form className="flex flex-col gap-4" onSubmit={enviarRecuperacao}>
            <label className={LABEL_CLASS}>
              E-mail cadastrado
              <input
                type="email"
                autoComplete="email"
                value={recuperar.email}
                onChange={(event) =>
                  setRecuperar({ email: event.target.value })
                }
                placeholder="seu@email.com"
                required
                className={INPUT_CLASS}
              />
            </label>

            <button
              type="submit"
              disabled={carregando}
              className="mt-2 flex min-h-11 w-full items-center justify-center rounded-pill bg-black font-body text-sm font-bold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {carregando ? "Enviando..." : "Solicitar ajuda"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}