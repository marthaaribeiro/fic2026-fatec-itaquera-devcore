# Front-end · Projeto Social Saúde Campinas

Aplicação web da plataforma: site institucional da ONG e área restrita para administradores, colaboradores e voluntários.

Voltar para o [README principal](../README.md).

## Sumário

1. [Tecnologias](#tecnologias)
2. [Instalação](#instalação)
3. [Variáveis de ambiente](#variáveis-de-ambiente)
4. [Scripts](#scripts)
5. [Estrutura de pastas](#estrutura-de-pastas)
6. [Rotas da aplicação](#rotas-da-aplicação)
7. [Comunicação com a API](#comunicação-com-a-api)
8. [Autenticação no front](#autenticação-no-front)
9. [Estilização e responsividade](#estilização-e-responsividade)
10. [Acessibilidade](#acessibilidade)
11. [Build e deploy](#build-e-deploy)
12. [Problemas comuns](#problemas-comuns)

## Tecnologias

| Pacote | Uso |
|---|---|
| React 19 | Biblioteca de interface |
| Vite | Criação do projeto, servidor de desenvolvimento e build |
| TypeScript | Tipagem (RNF-FE-01) |
| react-router-dom | Navegação entre telas (RNF-FE-04) |
| @tanstack/react-query | Cache e estado dos dados vindos da API (RNF-FE-03) |
| Axios | Cliente HTTP (RNF-FE-03) |
| TailwindCSS 4 | Estilização responsiva (RNF-FE-05) |
| lucide-react | Ícones |
| ESLint | Padronização do código |

## Instalação

Pré-requisitos: Node.js 22 LTS (mínimo 20.19) e a API rodando (ver [`backend/README.md`](../backend/README.md)).

```bash
cd frontend
npm install
cp .env.example .env      # no Windows: copy .env.example .env
npm run dev
```

A aplicação abre em `http://localhost:5173`.

## Variáveis de ambiente

| Variável | Descrição | Local | Produção |
|---|---|---|---|
| `VITE_API_URL` | Endereço base da API | `/api` | `https://[URL-DA-API]/api` |

- No ambiente local, o valor `/api` funciona junto com o **proxy do Vite** (ver [Comunicação com a API](#comunicação-com-a-api)).
- Variáveis com prefixo `VITE_` ficam visíveis no código enviado ao navegador. **Nunca** coloque segredos (senhas, chaves) aqui.
- Depois de mudar o `.env`, reinicie o `npm run dev`.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com recarregamento automático |
| `npm run build` | Verifica os tipos (`tsc -b`) e gera a versão de produção em `dist/` |
| `npm run preview` | Serve localmente o conteúdo de `dist/`, para conferir o build |
| `npm run lint` | Verifica o código com o ESLint |

## Estrutura de pastas

```
frontend/
├── public/                     Arquivos servidos sem processamento (favicon, logo)
├── src/
│   ├── assets/                 Imagens e ícones usados nas telas
│   ├── components/             Componentes reutilizáveis (RNF-FE-02)
│   │   ├── AccessCard/  Button/  DatePill/  EventCalendar/  EventCard/
│   │   ├── FaqItem/  Footer/  FormField/  Header/  Kicker/
│   │   ├── LogoutButton/  MessageBox/  MuralBoard/  Tag/
│   │   ├── ValueCard/  VolunteerList/
│   │   └── index.ts            Exporta todos os componentes
│   ├── contexts/
│   │   └── AuthContext.tsx     Sessão do usuário logado
│   ├── hooks/                  Hooks de dados (React Query): login, cadastro, solicitações…
│   ├── lib/
│   │   └── api.ts              Instância do Axios com token e tratamento de 401
│   ├── pages/                  Uma pasta por tela
│   │   ├── Home/  Sobre/  Eventos/  Doacao/  Contato/  Login/
│   │   ├── DashboardAdmin/  DashboardColaborador/  DashboardVoluntario/
│   │   └── DashboardMedicamentos/  DashboardDoacoes/
│   ├── routes/
│   │   ├── AppRoutes.tsx       Mapa de rotas
│   │   └── RotaProtegida.tsx   Bloqueia rotas por perfil
│   ├── services/               Funções que chamam a API, separadas por assunto
│   ├── styles/
│   │   └── globals.css
│   ├── types/                  Tipos TypeScript compartilhados (auth, dashboard…)
│   ├── tokens.css              Cores, fontes e espaçamentos do design
│   ├── index.css
│   ├── App.tsx
│   └── main.tsx                Ponto de entrada: providers do React Query, Router e Auth
├── index.html
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
├── .env.example
└── package.json
```

**Convenções**
- Componentes e páginas em `PascalCase`, um por pasta, com o CSS específico (se houver) na mesma pasta.
- Chamadas à API ficam em `services/` ou `hooks/`, nunca direto dentro das páginas.
- Tipos que representam dados da API ficam em `types/` e espelham o contrato descrito no README do back-end.

## Rotas da aplicação

| Rota | Tela | Acesso |
|---|---|---|
| `/` | Página inicial | Público |
| `/sobre` | Sobre a ONG | Público |
| `/eventos` | Agenda de ações | Público |
| `/doacao` | Como doar e itens em falta | Público |
| `/contato` | Contato | Público |
| `/login` | Login, cadastro e recuperação de acesso | Público |
| `/dashboard/admin` | Painel do administrador e aprovação de cadastros | Administrador |
| `/dashboard/colaborador` | Painel do colaborador | Administrador, Colaborador |
| `/dashboard/medicamentos` | Estoque de medicamentos | Administrador, Colaborador |
| `/dashboard/doacoes` | Doações | Administrador, Colaborador |
| `/dashboard/voluntario` | Painel do voluntário | Voluntário |

As rotas restritas usam o componente `RotaProtegida`. Quem não está logado vai para `/login`; quem está logado com outro perfil vai para o próprio painel.

> O controle de acesso no front existe para a experiência de uso. Quem realmente bloqueia o acesso aos dados é a API, que confere o token e o perfil em cada requisição.

## Comunicação com a API

- Todas as chamadas passam pela instância do Axios em `src/lib/api.ts`, que:
  - usa `VITE_API_URL` como endereço base;
  - adiciona o cabeçalho `Authorization: Bearer <token>` quando há sessão;
  - encerra a sessão automaticamente quando a API responde `401`.
- Os dados são buscados e atualizados com **React Query** (`useQuery` para leitura, `useMutation` para escrita). Depois de uma alteração, as listas afetadas são recarregadas com `invalidateQueries`.
- Os erros da API chegam no formato `{ mensagem, codigo?, erros? }` e são exibidos ao usuário. A função `lerErro()` de `lib/api.ts` faz essa leitura.

**Proxy em desenvolvimento.** O `vite.config.ts` redireciona `/api` para a API local, evitando problemas de CORS:

```ts
server: {
  proxy: { '/api': 'http://localhost:3000' },
},
```

## Autenticação no front

1. **Cadastro:** formulário único, onde a pessoa escolhe **Colaborador** ou **Voluntário**. Após o envio, é exibida a mensagem de que o cadastro aguarda aprovação. Não há login automático.
2. **Login:** se o cadastro ainda estiver pendente ou tiver sido rejeitado, a tela mostra a mensagem correspondente (códigos `CADASTRO_PENDENTE` e `CADASTRO_REJEITADO` da API).
3. **Sessão:** o token fica no `sessionStorage` e expira em 8 horas. Os dados do usuário (nome, perfil) vêm sempre de `GET /api/auth/me`, nunca de informações salvas no navegador.
4. **Aprovação:** no painel do administrador, a lista de solicitações pendentes permite aprovar ou rejeitar cada cadastro, com motivo opcional na rejeição.

## Estilização e responsividade

- **TailwindCSS 4**, integrado ao Vite pelo plugin `@tailwindcss/vite`.
- As cores, fontes e espaçamentos do design ficam centralizados em `src/tokens.css`.
- Todas as telas são testadas em **celular e desktop** (RNF-DES-01). Para conferir, use o modo de dispositivo do DevTools (`Ctrl+Shift+M`).

## Acessibilidade

A acessibilidade é o critério de desempate da Grande Final (Anexo IV, seção 5). Práticas adotadas:

- HTML semântico (`header`, `main`, `nav`, `footer`, `button` para ações, `a` para navegação).
- Todo campo de formulário tem `label` associado, e mensagens de erro usam `role="alert"`.
- Imagens informativas têm `alt` descritivo; imagens decorativas usam `alt=""`.
- Foco visível e navegação completa pelo teclado.
- Contraste de cores de acordo com a WCAG AA.

<!-- Sugestão: rodar o Lighthouse (aba Lighthouse do DevTools, categoria Accessibility)
     nas principais telas e registrar a nota aqui. -->

## Build e deploy

```bash
npm run build      # gera dist/
npm run preview    # confere o build localmente
```

- **Plataforma:** `Microsoft Azure`
- **Diretório raiz do projeto na plataforma:** `frontend`
- **Comando de build:** `npm run build`
- **Pasta publicada:** `dist`
- **Variável de ambiente:** `VITE_API_URL` com a URL pública da API, terminando em `/api`.

Como a navegação usa react-router-dom, a plataforma precisa redirecionar todas as rotas para o `index.html`. Sem isso, atualizar a página em `/dashboard/admin` resulta em 404.

## Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| "Não foi possível conectar ao servidor" / `Failed to fetch` | A API não está rodando | Suba a API (`npm run dev` em `backend/`) |
| "blocked by CORS policy" | O front não está usando o proxy ou a URL do front não está liberada na API | Use `VITE_API_URL=/api` localmente; em produção, inclua a URL do front em `CORS_ORIGINS` da API |
| Erro 404 nas chamadas | `VITE_API_URL` sem o `/api` ou rota com nome diferente | Confira a variável e a tabela de rotas do back-end |
| Volta para o login sozinho | Token expirado ou usuário desativado/rejeitado | Faça login novamente; se persistir, fale com a administração |
| 404 ao atualizar a página em produção | Falta o redirecionamento para o `index.html` | Veja [Build e deploy](#build-e-deploy) |
| Variável do `.env` não muda nada | O Vite só lê o `.env` ao iniciar | Reinicie o `npm run dev` |