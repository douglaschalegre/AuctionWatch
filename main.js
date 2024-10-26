import dotenv from 'dotenv'
import express from 'express'
import db from './database.js';

import { getAccessToken } from './consumers/login.js';
import { fetchAuctions } from './consumers/auctions.js';
import { fetchItemInAllRealms } from './services/item.js';

const app = express();
const PORT = 3000;
app.use(express.json());
dotenv.config();

let accessToken = getAccessToken();

// Configura a rota para obter leilões
app.get('/auctions/:connectedRealmId', async (req, res) => {
    const { connectedRealmId } = req.params;
    const data = await fetchAuctions(connectedRealmId, accessToken);
    if (data) {
        res.json(data);
    } else {
        res.status(500).send("Erro ao obter os dados de leilões.");
    }
});


// Endpoint para consultar informações do item em todos os connected realms
app.get('/item-auctions/:itemId', async (req, res) => {
    const { itemId } = req.params;
    const data = await fetchItemInAllRealms(itemId, accessToken);
    if (data.itemData.length > 0) {
        res.json(data);
    } else {
        res.status(404).send("Item não encontrado em nenhum connected realm.");
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
