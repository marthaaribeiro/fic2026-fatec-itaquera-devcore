<!--
  SUGESTÃO DE README DO BACK-END (RNF-QUA-06)
  - Escrito considerando a pasta backend/ (hoje: back-end/).
  - A estrutura de pastas, as rotas com prefixo /api, Sequelize, testes, Swagger e o seed do admin
    seguem o "Guia de melhorias do projeto" (seções 3, 4, 5 e 8). Atualizem este arquivo
    conforme forem implementando, para que ele descreva exatamente o que existe no código.
  - Comentários como este não aparecem no GitHub; apaguem-nos antes da entrega final.
-->

# Back-end · API Projeto Social Saúde Campinas

API REST da plataforma, responsável por autenticação, aprovação de cadastros, estoque de medicamentos e eventos.

Voltar para o [README principal](../README.md).

## Sumário

1. [Tecnologias](#tecnologias)
2. [Estrutura de pastas](#estrutura-de-pastas)
3. [Instalação](#instalação)
4. [Variáveis de ambiente](#variáveis-de-ambiente)
5. [Banco de dados](#banco-de-dados)
6. [Scripts](#scripts)
7. [Autenticação e perfis](#autenticação-e-perfis)
8. [Rotas da API](#rotas-da-api)
9. [Padrão de respostas e erros](#padrão-de-respostas-e-erros)
10. [Testes](#testes)
11. [Documentação da API (Swagger)](#documentação-da-api-swagger)
12. [Deploy](#deploy)
13. [Problemas comuns](#problemas-comuns)

## Tecnologias

| Pacote | Uso |
|---|---|
| Node.js 22 LTS (mínimo 20.19) | Ambiente de execução |
| Express 5 | Servidor HTTP e rotas |
| Sequelize + mysql2 | ORM e driver do MySQL |
| jsonwebtoken | Autenticação via JWT |
| bcrypt | Hash de senhas |
| zod | Validação dos dados de entrada |
| helmet, cors, express-rate-limit | Segurança da API |
| dotenv | Leitura das variáveis de ambiente |
| swagger-ui-express, swagger-jsdoc | Documentação da API |
| jest, supertest | Testes automatizados |
| nodemon | Recarregamento automático em desenvolvimento |

## Estrutura de pastas

O código segue a separação **routes → controllers → services → models** (RNF-BE-01).

```
backend/
├── src/
│   ├── config/
│   │   └── database.js         Conexão Sequelize com o MySQL
│   ├── models/                 Definição das tabelas (Sequelize)
│   │   ├── Usuario.js
│   │   ├── Evento.js
│   │   ├── Remedio.js
│   │   └── RemedioHistorico.js
│   ├── services/               Regras de negócio
│   ├── controllers/            Recebem a requisição, chamam o service e respondem
│   ├── routes/                 Definição das rotas e middlewares de cada uma
│   ├── middlewares/
│   │   ├── autenticar.js       Valida o JWT e o status do usuário no banco
│   │   ├── autorizar.js        Restringe a rota por perfil
│   │   ├── validar.js          Valida o corpo da requisição com zod
│   │   ├── limiteLogin.js      Limita tentativas de login
│   │   └── errorHandler.js     Tratamento central de erros
│   ├── validators/             Schemas zod de entrada
│   ├── docs/
│   │   └── swagger.js          Configuração do Swagger
│   ├── utils/
│   │   ├── AppError.js
│   │   └── calcularIdade.js
│   ├── app.js                  Monta o Express (sem listen; usado também nos testes)
│   └── server.js               Conecta ao banco e inicia o servidor
├── scripts/
│   └── seedAdmin.js            Cria o primeiro administrador
├── tests/                      Testes Jest + Supertest
├── .env.example
└── package.json
```

## Instalação

```bash
cd backend
npm install
cp .env.example .env      # no Windows: copy .env.example .env
```

Preencha o `.env` (ver a próxima seção), crie o banco e rode:

```bash
npm run seed:admin
npm run dev
```

A API sobe em `http://localhost:3000`. Para conferir: `http://localhost:3000/api/health` deve responder `{"ok":true}`.

## Variáveis de ambiente

O arquivo `.env` **nunca** é commitado (RNF-SEG-05). Use o `.env.example` como modelo.

| Variável | Obrigatória | Descrição | Exemplo |
|---|---|---|---|
| `PORT` | não | Porta da API. Em produção, é definida pela plataforma. | `3000` |
| `BD_HOST` | sim | Endereço do MySQL | `localhost` |
| `BD_PORT` | não | Porta do MySQL | `3306` |
| `BD_USER` | sim | Usuário do MySQL | `root` |
| `BD_PASSWORD` | sim | Senha do MySQL | |
| `BD_DATABASE` | sim | Nome do banco | `ong_saude` |
| `ASSINATURA_TOKEN` | sim | Chave secreta para assinar o JWT. Use um valor aleatório e longo. | ver abaixo |
| `CORS_ORIGINS` | sim | Origens do front permitidas, separadas por vírgula | `http://localhost:5173` |
| `ADMIN_EMAIL` | só para o seed | E-mail do primeiro administrador | |
| `ADMIN_SENHA` | só para o seed | Senha do primeiro administrador (mínimo 8 caracteres) | |

Para gerar um valor seguro para `ASSINATURA_TOKEN`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Use valores **diferentes** no ambiente local e em produção.

## Banco de dados

### Tabelas

| Tabela | Conteúdo |
|---|---|
| `usuarios` | Administradores, colaboradores e voluntários, com o status do cadastro |
| `evento` | Ações e mutirões da ONG |
| `remedio` | Estoque de medicamentos e insumos |
| `remedio_usuario` | Histórico de alterações no estoque (quem alterou e quando) |

<!-- Se houver tabela de inscrições em eventos (ex.: inscricao_evento), incluam aqui. -->

**Campos principais de `usuarios`**

| Campo | Descrição |
|---|---|
| `tipo_usuario` | `adm`, `func` (colaborador) ou `voluntario` |
| `status_cadastro` | `pendente`, `aprovado` ou `rejeitado` |
| `status` | `true` se o usuário está ativo; `false` se foi desativado |
| `senha_usuario` | Hash bcrypt da senha. Nunca é retornado pela API. |

### Criação

1. Crie o banco vazio:
   ```sql
   CREATE DATABASE ong_saude CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Crie as tabelas: [`npm run db:sync` / `mysql -u root -p ong_saude < database/schema.sql`]
   <!-- Escolham UMA forma e documentem aqui: sequelize.sync(), migrations do sequelize-cli ou um schema.sql versionado. -->
3. Crie o primeiro administrador:
   ```bash
   npm run seed:admin
   ```
   O script lê `ADMIN_EMAIL` e `ADMIN_SENHA` do `.env` e cria o usuário já aprovado. Se ele já existir, nada é alterado.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia a API com nodemon (recarrega ao salvar) |
| `npm start` | Inicia a API com node (uso em produção) |
| `npm test` | Roda os testes automatizados |
| `npm run seed:admin` | Cria o primeiro administrador |

<!-- Confiram se os scripts do package.json batem com esta tabela. Sugestão:
"dev": "nodemon src/server.js",
"start": "node src/server.js",
"test": "cross-env NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest --runInBand",
"seed:admin": "node scripts/seedAdmin.js"
-->

## Autenticação e perfis

- A autenticação usa **JWT** (RNF-SEG-01), enviado no cabeçalho `Authorization: Bearer <token>`.
- O token vale por **8 horas**.
- As senhas são armazenadas com **bcrypt** (RNF-SEG-02).
- A cada requisição protegida, o middleware `autenticar` confere no banco se o usuário continua **ativo** e **aprovado**. Assim, um usuário rejeitado ou desativado perde o acesso na hora, mesmo com um token ainda válido.
- O perfil usado nas permissões vem do banco, não do token.

| Perfil | Valor no banco |
|---|---|
| Administrador | `adm` |
| Colaborador | `func` |
| Voluntário | `voluntario` |

**Fluxo de cadastro e aprovação**

1. `POST /api/auth/cadastro` cria o usuário com status `pendente`. Não devolve token. O perfil só pode ser `func` ou `voluntario`; não é possível se cadastrar como administrador.
2. Enquanto o status for `pendente` ou `rejeitado`, o login responde `403` com o código `CADASTRO_PENDENTE` ou `CADASTRO_REJEITADO`. Esse status só é informado se a senha estiver correta.
3. O administrador lista as solicitações em `GET /api/admin/solicitacoes` e decide em `PATCH /api/admin/solicitacoes/:id`.
4. Depois de aprovado, o login devolve o token.

## Rotas da API

Todas as rotas têm o prefixo `/api`. A documentação completa, com exemplos de corpo e resposta, está no [Swagger](#documentação-da-api-swagger).

<!-- Hoje as rotas não têm o prefixo /api e algumas têm outros nomes (/cadastro, /login,
     /pagAdm, /pagFunc, /remedio). Atualizem esta tabela conforme as rotas reais. -->

**Legenda de acesso:** 🌐 público · 🔒 qualquer usuário logado · 👤 perfis indicados

### Autenticação

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/auth/cadastro` | 🌐 | Cria uma solicitação de cadastro (status `pendente`) |
| `POST` | `/auth/login` | 🌐 | Autentica e devolve o JWT. Limitado a 10 tentativas a cada 15 minutos. |
| `GET` | `/auth/me` | 🔒 | Dados do usuário logado |

### Administração

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/admin/solicitacoes?status=pendente` | 👤 adm | Lista cadastros por status |
| `PATCH` | `/admin/solicitacoes/:id` | 👤 adm | Aprova ou rejeita: `{ "decisao": "aprovar" \| "rejeitar", "motivo"?: "..." }` |
| `GET` | `/funcionarios` | 👤 adm | Lista colaboradores ativos |
| `POST` | `/funcionarios` | 👤 adm | Cadastra um colaborador |
| `PUT` | `/funcionarios/:id` | 👤 adm | Altera dados de um colaborador |
| `DELETE` | `/funcionarios/:id` | 👤 adm | Desativa um colaborador |

### Eventos

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/eventos` | 🌐 | Lista as próximas ações |
| `POST` | `/eventos` | 👤 adm, func | Cria um evento |
| `PUT` | `/eventos/:id` | 👤 adm, func | Altera um evento |
| `DELETE` | `/eventos/:id` | 👤 adm, func | Desativa um evento |

### Medicamentos

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/remedios` | 🌐 | Lista o estoque ativo, com indicação de vencidos |
| `POST` | `/remedios` | 👤 adm | Cadastra um medicamento |
| `PUT` | `/remedios/:id` | 👤 adm | Altera um medicamento |
| `PATCH` | `/remedios/:id/quantidade` | 👤 adm, func | Atualiza só a quantidade e registra no histórico |
| `DELETE` | `/remedios/:id` | 👤 adm | Desativa um medicamento |

### Utilitárias

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/health` | 🌐 | Verifica se a API está no ar |

## Padrão de respostas e erros

Os erros seguem sempre o mesmo formato:

```json
{
  "mensagem": "Texto legível para o usuário",
  "codigo": "CODIGO_OPCIONAL",
  "erros": { "campo": ["detalhe da validação"] }
}
```

| Status | Quando acontece |
|---|---|
| `400` | Dados inválidos (validação zod) ou JSON malformado |
| `401` | Sem token, token inválido/expirado, credenciais incorretas ou acesso revogado |
| `403` | Perfil sem permissão, ou cadastro `CADASTRO_PENDENTE` / `CADASTRO_REJEITADO` no login |
| `404` | Recurso ou rota inexistente |
| `409` | Registro duplicado (ex.: e-mail já cadastrado) |
| `422` | Regra de negócio violada (ex.: menor de 18 anos) |
| `429` | Muitas tentativas de login |
| `500` | Erro interno. O detalhe fica só no log do servidor. |

## Testes

Os testes usam **Jest** e **Supertest** (RNF-QUA-02) e rodam contra um **banco de testes separado**, configurado em `.env.test`.

```bash
npm test
```

Cenários cobertos:
<!-- Mantenham esta lista igual aos testes que existem de fato. -->
- Cadastro fica `pendente` e não devolve token.
- Não é possível se cadastrar como administrador.
- Menor de 18 anos é recusado.
- Login bloqueado enquanto o cadastro está pendente.
- Rotas de administração exigem token e perfil `adm`.
- Administrador aprova e o usuário passa a conseguir entrar.
- Senha errada e e-mail inexistente recebem a mesma resposta.
- [CRUD de eventos e permissões]
- [Atualização de quantidade de medicamentos]

## Documentação da API (Swagger)

Com a API rodando, acesse:

- Local: http://localhost:3000/api-docs
- Produção: [https://URL-DA-API]/api-docs

Para testar rotas protegidas no Swagger, faça login em `POST /auth/login`, copie o token e clique em **Authorize**.

## Deploy

- **Plataforma:** [Render / Railway]
- **Comando de build:** `npm install`
- **Comando de início:** `npm start`
- **Variáveis:** todas as da tabela [Variáveis de ambiente](#variáveis-de-ambiente), com valores de produção. `CORS_ORIGINS` deve conter a URL pública do front.
- **Banco:** [provedor MySQL], com conexão SSL.
- Depois do primeiro deploy, rode o seed do administrador uma única vez.

## Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| `ERR_CONNECTION_REFUSED` no front | A API não está rodando | Rode `npm run dev` dentro de `backend/` |
| `secretOrPrivateKey must have a value` | Falta `ASSINATURA_TOKEN` no `.env` | Crie o `.env` a partir do `.env.example` |
| `ECONNREFUSED 127.0.0.1:3306` | MySQL desligado ou dados de conexão errados | Confira o serviço do MySQL e as variáveis `BD_*` |
| `ER_ACCESS_DENIED_ERROR` | Usuário ou senha do MySQL incorretos | Confira `BD_USER` e `BD_PASSWORD` |
| "blocked by CORS policy" no navegador | A origem do front não está em `CORS_ORIGINS` | Adicione a URL exata do front (com protocolo e porta) |
| `401 Sessão inválida ou expirada` | Token ausente, expirado ou de outro ambiente | Faça login de novo |