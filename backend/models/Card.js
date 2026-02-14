const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema({
  originalId: Number,
  name: String,
  image: String,
  species: String,
  status: String,
  type: String,
  location: String,
  rarity: String, // 'COMMON', 'RARE', 'EPIC', 'LEGENDARY'

  stats: {
    survival: { type: Number, default: 0 },
    popularity: { type: Number, default: 0 },
    weirdness: { type: Number, default: 0 },
    complexity: { type: Number, default: 0 },
  },
});

module.exports = mongoose.model("Card", CardSchema);
