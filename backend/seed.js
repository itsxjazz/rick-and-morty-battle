require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Card = require('./models/Card');
const { calculateCardStats } = require('./utils/gameLogic');

const MONGO_URI = process.env.MONGO_URI;

// Função auxiliar para gerar páginas aleatórias únicas
const getRandomPages = (totalApiPages, pagesToFetch) => {
    const pages = new Set();
    while(pages.size < pagesToFetch) {
        // Gera número entre 1 e totalApiPages
        const randomPage = Math.floor(Math.random() * totalApiPages) + 1;
        pages.add(randomPage);
    }
    return Array.from(pages);
};

const importData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Conectado ao MongoDB...');

        console.log('Limpando banco antigo...');
        await Card.deleteMany({}); 

        const TOTAL_PAGES_API = 42; // Total de páginas disponíveis na API do Rick and Morty
        const PAGES_TO_FETCH = 15; // Quantas páginas aleatórias serão importadas. Ou seja, total de cartas = PAGES_TO_FETCH * 20 (pois cada página tem 20 personagens), que é 300 cartas.
        const pagesToVisit = getRandomPages(TOTAL_PAGES_API, PAGES_TO_FETCH);

        console.log(`Iniciando importação de ${PAGES_TO_FETCH} páginas aleatórias: [${pagesToVisit.join(', ')}]`);

        let count = 0;

        // Loop pelas páginas aleatórias escolhidas
        for (const page of pagesToVisit) {
            try {
                const response = await axios.get(`https://rickandmortyapi.com/api/character?page=${page}`);
                const characters = response.data.results;

                const cardsToSave = characters.map(char => {
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
                            complexity: gameData.attributes.complexity
                        },
                        rarity: gameData.rarity
                    };
                });

                await Card.insertMany(cardsToSave);
                count += cardsToSave.length;
                console.log(`Página ${page} importada com sucesso.`);
            } catch (err) {
                console.error(`Erro ao importar página ${page}:`, err.message);
            }
        }

        console.log(`\nImportação concluída! Total de ${count} cartas prontas para o duelo.`);
        process.exit();

    } catch (error) {
        console.error('Erro Crítico:', error);
        process.exit(1);
    }
};

importData();