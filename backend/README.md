# Rick & Morty Battle

O Rick & Morty Battle é um jogo de cartas colecionáveis e estratégico, desenvolvido como projeto pessoal para consolidar conhecimentos na Stack MEAN (MongoDB, Express, Angular, Node.js). O jogador recruta variantes do multiverso para duelar em uma arena baseada em atributos de sobrevivência, popularidade e estranheza.

**Resumo**
- Linguagem: JavaScript (Node.js)
- Framework: Express
- Banco: MongoDB (via Mongoose)

## Links do Projeto
- Jogo Completo: rick-and-morty-battle.vercel.app
- API Backend (Produção): rick-and-morty-battle.onrender.com

## Funcionalidades e Regras
O jogo segue as diretrizes do Conselho de Ricks:
- Recrutamento: Escolha entre variantes com diferentes níveis de raridade (Common, Rare, Epic, Legendary).
- Duelo "Best of 3": O combate é decidido em uma melhor de três rodadas, onde os atributos das cartas são comparados.
- Identificação de Stats: Cada carta possui três atributos principais:

        🛡️ Survival (Sobrevivência)

        ☀️ Popularity (Popularidade)

        👽 Weirdness (Estranheza)
- Progresso: Sistema de rastreamento de vitórias, derrotas e empates, com recorde de Win Streak.
- Mobile Ready: Interface otimizada para dispositivos móveis com trava de orientação (Landscape) para melhor jogabilidade.

## Pré-requisitos
- Node.js (>= 18 recomendado)
- MongoDB acessível (URI de conexão)
- Variáveis de ambiente configuradas em um arquivo `.env` ou no ambiente

Variáveis esperadas:
- `MONGO_URI` — string de conexão com o MongoDB
- `PORT` — porta HTTP (opcional, padrão 3000)

## Instalação
1. Abra um terminal na pasta `rick-morty-battle/backend`.
2. Instale dependências (se houver `package.json` neste diretório) ou no root do projeto:

```bash
# Se houver package.json aqui
npm install

# Caso o projeto use package.json no root
cd ../../
npm install
cd rick-morty-battle/backend
```

3. Crie um `.env` com sua URI do MongoDB:

```
MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/nomeDoBanco
PORT=3000
```

## Comandos úteis
- Importar (seed) 200 cartas da API pública e salvar no MongoDB:

```bash
node seed.js
```

- Rodar análise/checar balanceamento das cartas (mostra contagens por espécie, tipo e raridade):

```bash
node check-balance.js
```

- Iniciar servidor de desenvolvimento:

```bash
node server.js
```

> Obs.: você pode usar `nodemon` para recarregamento automático, se preferir.

## Endpoints
Base: `http://localhost:PORT` (ex.: http://localhost:3000)

- `GET /api/cards` — retorna uma lista de cartas (limit = 50 por padrão).

Exemplo:

```bash
curl http://localhost:3000/api/cards
```

- `GET /api/cards/:id` — retorna a carta cujo campo `originalId` (ID da API do Rick & Morty) corresponde a `:id`.

Exemplo:

```bash
curl http://localhost:3000/api/cards/1
```

## Modelo de dados (resumo)
As cartas são salvas no MongoDB com os campos principais:
- `originalId` (Number) — ID vindo da API do Rick & Morty
- `name`, `image`, `species`, `status`, `location`
- `stats` — informações de jogo: `total_battles`, `wins`, `attributes` (objetos com `survival`, `popularity`, `weirdness`, `complexity`)
- `rarity` — `COMMON | RARE | EPIC | LEGENDARY`

Ver `models/Card.js` para o schema completo.

## Lógica do jogo
O cálculo dos atributos das cartas fica em `utils/gameLogic.js`. Ele determina `survival`, `popularity`, `weirdness`, `complexity` e a `rarity` baseada em uma soma ponderada desses valores.

## Dicas e troubleshooting
- Erro de conexão com o MongoDB: verifique `MONGO_URI` e se seu IP/cluster permite conexões.
- Seed travando: cheque se a API externa (`rickandmortyapi.com`) está disponível e se sua conexão com a internet/cluster está estável.
- Porta ocupada: ajuste `PORT` no `.env` ou exporte a variável antes de iniciar.

## Arquivos principais
- `server.js` — inicializa Express e conecta as rotas.
- `routes/cards.js` — endpoints relacionados às cartas.
- `models/Card.js` — schema do Mongoose para as cartas.
- `seed.js` — script para popular o banco com cartas da API pública.
- `check-balance.js` — script de análise/estatísticas das cartas no DB.
- `utils/gameLogic.js` — regras e cálculo de atributos/raridade.

