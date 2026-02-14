# 🥒 Rick and Morty Battle Card Game

> Entre no multiverso e batalhe pela supremacia interdimensional.

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green)](https://nodejs.org/)
[![Angular](https://img.shields.io/badge/Angular-17%2B-red)](https://angular.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)

---

## 📖 Sobre o Projeto

**Rick and Morty Battle** é um jogo de cartas estratégico desenvolvido com a **MEAN Stack** (MongoDB, Express, Angular, Node.js). O jogo consome a **API oficial de Rick and Morty** para gerar cartas colecionáveis com atributos únicos, permitindo que jogadores duelem em uma arena dinâmica.

---

## 🚀 Funcionalidades Principais

### Mecânica de Batalha: Melhor de 3 (Best of 3)

Diferente de jogos que apenas somam atributos, aqui **a estratégia conta!**

- **Melhor de 3**: A batalha ocorre em 3 rodadas consecutivas
- **Atributos Dinâmicos**: Cada rodada compara um atributo específico (_Sobrevivência_, _Popularidade_ ou _Bizarrice_)
- **Fator Caos**: A ordem dos atributos é sorteada na hora, permitindo que uma carta Comum vença uma Lendária se tiver o atributo certo na rodada certa

### Fair Matchmaking (Pareamento Justo)

O sistema respeita faixas de poder para garantir duelos equilibrados:

| Raridade    | Tier      | Enfrenta                   |
| ----------- | --------- | -------------------------- |
| 🌟 Lendário | God Tier  | Lendários ou Épicos        |
| 💎 Épico    | High Tier | Lendários, Épicos ou Raros |
| 🔷 Raro     | Mid Tier  | Épicos, Raros ou Comuns    |
| ⚪ Comum    | Low Tier  | Raros ou Comuns            |

### Internacionalização (i18n)

- Suporte completo para **Português (PT)** e **Inglês (EN)**
- Tradução em tempo real de interface, atributos e nomes de personagens
- Persistência de preferência de idioma no navegador

### Mobile Experience

- Orientation Lock: Bloqueio visual solicitando modo paisagem (landscape)

---

## 🛠️ Tecnologias Utilizadas

### **Frontend (Client)**

- Framework: **Angular 17+** (Standalone Components)
- Estilização: **SCSS** (Sass) com variáveis CSS nativas e animações
- Deploy: **Vercel**

### **Backend (Server)**

- Runtime: **Node.js**
- Framework: **Express.js**
- Segurança: **CORS**, **Helmet**
- Deploy: **Render**

### **Database**

- Banco: **MongoDB Atlas**
- Modelagem: **Mongoose**
- Data Seeding: Script personalizado com 300+ cartas da API oficial

<!-- --- -->

<!-- ## 📸 Screenshots

| Tela | Preview |
|------|---------|
| Home | _(Insira aqui um print da Home)_ |
| Seleção de Cartas | _(Insira aqui um print da Seleção)_ |
| Arena de Batalha | _(Insira aqui um print da Batalha)_ |
| Vitória | _(Insira aqui um print da Vitória)_ | -->

---

## ⚙️ Como Rodar Localmente

Siga os passos abaixo para clonar e executar o projeto na sua máquina.

### Pré-requisitos

- **Node.js** (v18+)
- **MongoDB** (Local ou URI do Atlas)
- **npm** ou **yarn**

### Backend (API)

```bash
# Clone o repositório
git clone

# Entre na pasta do backend
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente (.env)
# Crie um arquivo .env com:
# PORT=3000
# MONGO_URI=sua_string_de_conexao_mongodb

# Popule o banco de dados (apenas na primeira vez)
node seed.js

# Inicie o servidor
npm start
```

**Servidor rodando em:** `http://localhost:3000`

### Frontend (Angular)

```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
ng serve --open
```

<!-- **Aplicação disponível em:** `http://localhost:4200` -->

---
