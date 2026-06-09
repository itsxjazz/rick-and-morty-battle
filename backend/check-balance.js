require("dotenv").config();
const mongoose = require("mongoose");
const Card = require("./models/Card");

const MONGO_URI = process.env.MONGO_URI;

const analyzeData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Conectado para análise de balanceamento (Multiverso)...\n");

    // Executa múltiplos agrupamentos em paralelo com uma única varredura de dados física
    const [auditResult] = await Card.aggregate([
      {
        $facet: {
          speciesStats: [
            { $group: { _id: "$species", total: { $sum: 1 } } },
            { $sort: { total: -1 } },
          ],
          typeStats: [
            { $match: { type: { $ne: "" } } }, // Ignora tipos vazios
            { $group: { _id: "$type", total: { $sum: 1 } } },
            { $sort: { total: -1 } },
          ],
          rarityStats: [
            { $group: { _id: "$rarity", total: { $sum: 1 } } },
            { $sort: { total: -1 } },
          ],
        },
      },
    ]);

    console.log("--- DISTRIBUIÇÃO POR ESPÉCIE ---");
    console.table(
      auditResult.speciesStats.map((s) => ({
        Espécie: s._id || "Desconhecido",
        Quantidade: s.total,
      }))
    );

    console.log("\n--- DISTRIBUIÇÃO POR SUB-TIPO (Especiais) ---");
    if (auditResult.typeStats.length > 0) {
      console.table(
        auditResult.typeStats.map((t) => ({
          Tipo: t._id,
          Quantidade: t.total,
        }))
      );
    } else {
      console.log("Nenhuma sub-especificação especial encontrada.");
    }

    console.log("\n --- DISTRIBUIÇÃO POR RARIDADE ---");
    console.table(
      auditResult.rarityStats.map((r) => ({
        Raridade: r._id,
        Quantidade: r.total,
      }))
    );

    process.exit(0);
  } catch (error) {
    console.error("Erro ao analisar os dados:", error);
    process.exit(1);
  }
};

analyzeData();
