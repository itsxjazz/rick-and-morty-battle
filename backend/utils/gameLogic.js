/**
 * Lógica Oficial do Jogo Rick & Morty Battle
 * Versão: 1.0
 */
const getRandom = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const calculateCardStats = (char) => {
  // --- 1. SOBREVIVÊNCIA (Status) ---
  let survival = 20;
  if (char.status === "Alive") {
    survival = getRandom(90, 100);
  } else if (char.status === "unknown") {
    survival = getRandom(50, 70);
  } else if (char.status === "Dead") {
    survival = getRandom(10, 30);
  }

  // --- 2. POPULARIDADE (Episódios) ---
  const episodeCount = char.episode.length;
  let popularity;

  if (episodeCount >= 50) {
    popularity = getRandom(95, 100); // Protagonistas (Rick/Morty)
  } else if (episodeCount >= 20) {
    popularity = getRandom(85, 94); // Recorrentes (Família Smith)
  } else if (episodeCount >= 10) {
    popularity = getRandom(70, 84); // Coadjuvantes frequentes
  } else if (episodeCount >= 2) {
    popularity = getRandom(40, 65); // Apareceram algumas vezes
  } else {
    // Personagens de 1 episódio: agora variam entre 15 e 35 para não travar no 10!
    popularity = getRandom(15, 35);
  }

  // --- 3. BIZARRIA (Espécie) ---
  // Mapeamento exato das espécies existentes nas 200 primeiras cartas
  const speciesMap = {
    "Mythological Creature": 100, // Zeus, Vampiros (Top Tier)
    Cronenberg: 95, // Monstros genéticos
    Disease: 90, // Doenças vivas
    Robot: 85, // Robôs
    Alien: 80, // Aliens comuns
    Poopybutthole: 75, // Ooooowee!
    Humanoid: 60, // Quase humanos
    Animal: 50, // Animais falantes
    Human: 15, // Humanos comuns (fracos)
    unknown: 10, // Desconhecido
  };

  // Se a espécie não estiver na lista (segurança), assume valor médio (40)
  let weirdness = speciesMap[char.species] || 40;

  // --- 4. O FATOR "MAIN CHARACTER" (Salvação dos Humanos) ---
  // Se for Humano E aparecer em muitos episódios (Rick, Morty, Summer, Beth, Jerry)
  // Ganha um bônus para não perder de qualquer alienígena
  let protagonistBonus = 0;
  if (char.species === "Human" && popularity >= 90) {
    protagonistBonus = 50;
  }

  // --- 5. DEFINE A RARIDADE ---
  const cap = (val) => Math.min(100, Math.max(0, val));

  // Soma total dos poderes (para definir raridade)
  const totalPower =
    cap(survival) + cap(popularity) + cap(weirdness) + protagonistBonus;

  // Definição das Classes
  let rarity = "COMMON";

  if (totalPower >= 230)
    rarity = "LEGENDARY"; // Rick, Morty e cartas perfeitas
  else if (totalPower >= 190)
    rarity = "EPIC"; // Personagens muito fortes ou aliens recorrentes
  else if (totalPower >= 145)
    rarity = "RARE"; // Personagens acima da média
  else rarity = "COMMON"; // Humanos comuns e figurantes (< 160)

  return {
    attributes: {
      survival: cap(survival),
      popularity: cap(popularity),
      weirdness: cap(weirdness),
      // Complexity é a média de poder da carta
      complexity: cap(Math.floor(totalPower / 3)),
    },
    rarity,
  };
};

module.exports = { calculateCardStats };
