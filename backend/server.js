require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. LISTA DE PERMISSÕES ATUALIZADA (Multiverso Autorizado)
const allowedOrigins = [
  "http://localhost:4200",
  "https://bookish-eureka-5gx56vr9pj4vf7wxg-4110.app.github.dev",
  "https://rick-and-morty-battle.onrender.com",
  "https://rick-and-morty-battle-git-main-jessicas-projects-360d1e1f.vercel.app",
  "https://rick-and-morty-battle.vercel.app",
  "https://itsxjazz.itch.io/rick-and-morty-battle",
  "https://html-classic.itch.zone",
];

// 2. CONFIGURAÇÃO  DO CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Bloqueado pelo Conselho de Ricks (CORS)"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

// 3. ROTA DE HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "online",
    message: "Portal interdimensional aberto!",
    timestamp: new Date(),
  });
});

// Conexão com o Banco
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Conectado!"))
  .catch((err) => console.error("Erro ao conectar:", err));

const cardsRouter = require("./routes/cards");
app.use("/api/cards", cardsRouter);

app.get("/", (req, res) => {
  res.send("API Rick and Morty Battle está rodando!");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
