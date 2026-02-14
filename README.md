# 🥒 Rick and Morty Battle: Card Game

> **Domine as dimensões. Comande seu baralho. Sobreviva ao caos.**

Este é um jogo de cartas **Full Stack (MEAN)** onde os personagens do universo de Rick and Morty ganham vida através de atributos dinâmicos e uma economia de jogo balanceada.

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green)](https://nodejs.org/)
[![Angular](https://img.shields.io/badge/Angular-17%2B-red)](https://angular.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)

---

## 🔗 Links do Projeto

| Plataforma | Link de Acesso |
| :--- | :--- |
| **🚀 Vercel** | [Acesse o Jogo Aqui](https://rick-and-morty-battle.vercel.app/) |
| **🎮 Itch.io** | [Página no Itch.io](https://itsxjazz.itch.io/rick-and-morty-battle) |
| **📺 YouTube** | [Assistir Demonstração](https://youtu.be/5jprBz-wzlM) |

---

## 📖 Sobre o Projeto

O **Rick and Morty Battle** utiliza a API oficial da série para gerar cartas colecionáveis. O projeto foi desenvolvido com a **MEAN Stack** (MongoDB, Express, Angular, Node.js). O grande diferencial técnico está no **Algoritmo de Balanceamento de Raridade**, que processa dados brutos (status, espécie e episódios) para classificar cada carta em tiers, garantindo uma experiência de jogo justa e viciante.

---

## 📸 Screenshots do Jogo

<div align="center">
  <img width="1920" alt="Home Screen" src="https://github.com/user-attachments/assets/d988892b-3fde-40fd-9adc-1d4c39d32462" />
  <p><em>Baralho com as cartas</em></p>
  
  <img width="1920" alt="Selection Screen" src="https://github.com/user-attachments/assets/0d1f07fe-e25e-48f5-a9cc-9c64b0eb50b4" />
  <p><em>Interface de seleção de cartas com sistema de tiers</em></p>
  
  <img width="1920" alt="Battle Arena" src="https://github.com/user-attachments/assets/87767bfc-6fe2-42cd-9ce7-da14e1e6c635" />
  <p><em>Arena de Batalha com lógica MD3 (Melhor de 3)</em></p>

  <img width="1920" alt="Modais" src="https://github.com/user-attachments/assets/2622ede7-8fce-47ab-9276-74191abe2973" />
  <p><em>Instruções e Regras do Jogo</em></p>

  <img width="1920" alt="Resultado" src="https://github.com/user-attachments/assets/90713f5f-4d78-4316-9ab0-27d5a075e36f" />
  <p><em>Feedback visual de vitória/derrota</em></p>

  <img width="1890" alt="Vitrine de Cartas" src="https://github.com/user-attachments/assets/3b75edf3-d727-44bd-b9b8-8a4ba16833b8" />
  <p><em>Showcase Mode: Teste visual de todas as raridades</em></p>
</div>

---

## 🚀 Funcionalidades Principais

### ⚔️ Lógica de Batalha: Melhor de 3 (MD3)
Diferente de sistemas lineares, aqui a estratégia é fundamental:
- **Atributos Dinâmicos:** Cada rodada foca em **Sobrevivência**, **Popularidade** ou **Bizarrice**.
- **Fator Caos:** A ordem dos atributos é aleatória, permitindo reviravoltas onde uma carta comum pode vencer uma lendária no atributo certo.

### ⚖️ Sistema de Raridade & Fair Play
Há um sistema de pesos para equilibrar o "drop rate" e garantir duelos equilibrados:

| Raridade | Tier | Enfrenta | Requisito (Total Power) |
| :--- | :--- | :--- | :--- |
| 🌟 **Lendário** | God Tier | Lendários ou Épicos | ≥ 230 |
| 💎 **Épico** | High Tier | Lendários, Épicos ou Raros | ≥ 190 |
| 🔷 **Raro** | Mid Tier | Épicos, Raros ou Comuns | ≥ 145 |
| ⚪ **Comum** | Low Tier | Raros ou Comuns | < 145 |

### 🌍 Internacionalização 
- **Bilingue:** Suporte completo para **Português (PT)** e **Inglês (EN)** com persistência de escolha via `localStorage`.

### 📱 Mobile Experience
- **Orientation Lock:** Bloqueio visual solicitando modo paisagem (landscape) para garantir a melhor experiência de jogo em dispositivos móveis.

---

## 🧠 Arquitetura e Decisões Técnicas

Este projeto vai além do consumo de API, implementando pipelines de dados e algoritmos de balanceamento.

### 1. Backend: Controle e Performance
* **Modelagem (`models/Card.js`)**: Utiliza **Mongoose Schemas** para definição de tipagem estrita e organização de atributos (`stats`).
* **Agregação (`routes/cards.js`)**: O sorteio de cartas utiliza o estágio **`$sample`** do MongoDB Aggregation Pipeline.
    * *Diferencial:* Delegar o sorteio ao banco de dados (Atlas) economiza memória do servidor (Render) e otimiza a performance para grandes volumes de dados.

### 2. Pipeline de Dados (ETL)
O script de seeding (`seed.js`) executa um processo robusto de **Extract, Transform, Load**:
* **Extract**: Seleção aleatória de páginas da API para diversidade do deck.
* **Transform**: Conversão de metadados brutos em atributos de RPG equilibrados via `gameLogic.js`.
* **Load**: Persistência eficiente utilizando `insertMany`.

### 3. Auditoria e BI (`check-balance.js`)
Ferramenta interna que gera relatórios de distribuição de raridade e espécies, garantindo que o "meta-game" permaneça saudável (ex: manter cartas Lendárias em apenas ~1.6% do total).

---

## 🛠️ Tecnologias Utilizadas

### **Frontend (Angular)**
- **Framework:** Angular 17+ (Componentes Standalone)
- **Serviços:** Injeção de dependência e Observables (RxJS) para comunicação assíncrona.
- **Estilização:** SCSS (Sass) com Mixins, variáveis nativas e Glassmorphism.

### **Backend (Node.js)**
- **Framework:** Express.js
- **Segurança:** Helmet, CORS e sanitização de dados.
- **Banco de Dados:** MongoDB Atlas com Mongoose.

### **Infraestrutura**
- **Deploy Frontend:** Vercel
- **Deploy Backend:** Render

---

## ⚙️ Como Rodar Localmente

### Pré-requisitos
- **Node.js** (v18+)
- **MongoDB** (Local ou URI do Atlas)
- **npm** ou **yarn**

### Backend e Frontend 
```bash
cd backend
npm install
# Configure o .env com PORT e MONGO_URI
node seed.js # Popula o banco
npm start

cd frontend
npm install
ng serve --open
