const express = require("express");
const router = express.Router();
const Card = require("../models/Card");

// ROTA 1: Pegar cartas ALEATÓRIAS (GET /api/cards)
router.get("/", async (req, res) => {
  try {
    const cards = await Card.aggregate([
      { $sample: { size: 300 } }, // Pega 300 cartas aleatórias do banco
    ]);

    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ROTA 2: Pegar uma carta específica pelo ID (GET /api/cards/:id)
router.get("/:id", async (req, res) => {
  try {
    const card = await Card.findOne({ originalId: req.params.id });
    if (!card)
      return res
        .status(404)
        .json({ message: "Carta não encontrada nesta dimensão" });
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
