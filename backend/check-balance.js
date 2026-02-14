require('dotenv').config();
const mongoose = require('mongoose');
const Card = require('./models/Card');

const MONGO_URI = process.env.MONGO_URI;

const analyzeData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log(' Conectado para análise...\n');

        console.log('--- CONTAGEM POR ESPÉCIE ---');
        // Agrupa por espécie e conta
        const speciesStats = await Card.aggregate([
            { $group: { _id: "$species", total: { $sum: 1 } } },
            { $sort: { total: -1 } } // Ordena do maior para o menor
        ]);
        
        // Exibe como uma tabela no terminal
        console.table(speciesStats.map(s => ({ Espécie: s._id, Quantidade: s.total })));


        console.log('\n--- CONTAGEM POR TIPO (Especiais) ---');
        // Agrupa por tipo, mas filtra os vazios para não poluir
        const typeStats = await Card.aggregate([
            { $match: { type: { $ne: "" } } }, // Ignora tipos vazios
            { $group: { _id: "$type", total: { $sum: 1 } } },
            { $sort: { total: -1 } }
        ]);

        console.table(typeStats.map(t => ({ Tipo: t._id, Quantidade: t.total })));

        console.log('\n--- CONTAGEM POR RARIDADE ---');
        const rarityStats = await Card.aggregate([
            { $group: { _id: "$rarity", total: { $sum: 1 } } },
            { $sort: { total: -1 } }
        ]);
        console.table(rarityStats.map(r => ({ Raridade: r._id, Quantidade: r.total })));

        process.exit();
    } catch (error) {
        console.error('Erro:', error);
        process.exit(1);
    }
};

analyzeData();