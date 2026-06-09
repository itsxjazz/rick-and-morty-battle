require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const Card = require("./models/Card");
const { calculateCardStats } = require("./utils/gameLogic");

const MONGO_URI = process.env.MONGO_URI;

// Função auxiliar para atrasar a execução (evitar rate limiting)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Função auxiliar para gerar páginas aleatórias únicas
const getRandomPages = (totalApiPages, pagesToFetch) => {
  const pages = new Set();
  while (pages.size < pagesToFetch) {
    const randomPage = Math.floor(Math.random() * totalApiPages) + 1;
    pages.add(randomPage);
  }
  return Array.from(pages);
};

// Função de busca com retentativa (Exponential Backoff) para resiliência de rede/rate limit
const fetchPageWithRetry = async (page, retries = 3, delayMs = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(
        `https://rickandmortyapi.com/api/character?page=${page}`,
        { timeout: 10000 } // Timeout de 10s
      );
      return response.data.results;
    } catch (err) {
      const isLast = i === retries - 1;
      console.warn(
        `[Página ${page}] Falha na tentativa ${i + 1}/${retries}: ${err.message}.` +
        (isLast ? " Desistindo." : ` Re-tentando em ${delayMs}ms...`)
      );
      if (isLast) throw err;
      await delay(delayMs);
      delayMs *= 2; // Dobra o tempo de espera (backoff exponencial)
    }
  }
};

const importData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(" Conectado ao MongoDB...");

    // REMOVIDO: Card.deleteMany({}) para evitar indisponibilidade de cartas na Vercel

    const TOTAL_PAGES_API = 42;
    const PAGES_TO_FETCH = 15;
    const pagesToVisit = getRandomPages(TOTAL_PAGES_API, PAGES_TO_FETCH);

    console.log(
      `Iniciando seed incremental de ${PAGES_TO_FETCH} páginas: [${pagesToVisit.join(", ")}]`
    );

    let count = 0;

    for (const page of pagesToVisit) {
      try {
        // Busca com retentativas resilientas
        const characters = await fetchPageWithRetry(page);

        // Prepara os dados das cartas calculando os atributos com base na lógica do jogo
        const cardsToSave = characters.map((char) => {
          const gameData = calculateCardStats(char);

          return {
            originalId: char.id,
            name: char.name,
            image: char.image,
            species: char.species,
            type: char.type,
            status: char.status,
            location: char.location.name,
            stats: {
              survival: gameData.attributes.survival,
              popularity: gameData.attributes.popularity,
              weirdness: gameData.attributes.weirdness,
              complexity: gameData.attributes.complexity,
            },
            rarity: gameData.rarity,
          };
        });

        // Converte as cartas em operações de BulkWrite com Upsert para evitar duplicações e downtime
        const bulkOps = cardsToSave.map((card) => ({
          updateOne: {
            filter: { originalId: card.originalId },
            update: { $set: card },
            upsert: true,
          },
        }));

        const result = await Card.bulkWrite(bulkOps);
        const importedCount = result.upsertedCount + result.modifiedCount;
        count += importedCount;
        console.log(`✅ Página ${page} importada: ${importedCount} documentos adicionados/atualizados.`);

        // Delay de segurança de 300ms entre as requisições de página para respeitar o rate-limit da API externa
        await delay(300);
      } catch (err) {
        console.error(`Erro ao processar página ${page}:`, err.message);
      }
    }

    console.log(
      `\nImportação concluída! Total de ${count} registros processados de forma incremental.`
    );
    process.exit(0);
  } catch (error) {
    console.error("💥 Erro Crítico durante a importação:", error);
    process.exit(1);
  }
};

importData();
