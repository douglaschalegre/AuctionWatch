import dotenv from 'dotenv'
import express from 'express'
import {sequelize} from './database.js';
import { MonitoredItem } from './domain/models/MonitoredItem.js';

import { getAccessToken } from './consumers/login.js';
import { fetchAuctions } from './consumers/auctions.js';

import { fetchItemInAllRealms } from './services/item.js';

(async () => {
    try {
      await sequelize.sync();
      console.log('[*] Banco de dados sincronizado');
    } catch (error) {
      console.error('Erro ao sincronizar o banco de dados:', error);
    }
  })();

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

// Endpoint para adicionar um item à lista monitorada
app.post('/monitored-items', async (req, res) => {
    const { item_id } = req.body;
  
    if (!item_id) {
      res.status(400).json({ error: "ID do item é obrigatório" });
      return;
    }
    
    try {
        // const existingItem = await MonitoredItem.findOne({ where: { item_id } });
        // if (existingItem) {
        //     res.status(200).json({ message: "O item já está sendo monitorado", item: existingItem });
        //     return;
        // }
        // // Busca informações do item na API da Battle.net
        // const itemInfo = await fetchItemInfo(item_id, accessToken);
        // if (!itemInfo) {
        //     res.status(500).json({ error: "Erro ao obter informações do item" });
        //     return;
        // }
    
        // const { name, description, item_level } = itemInfo;
        const monitoredItem = await MonitoredItem.create({
            item_id,
            name: null,
            description: null,
            item_level: null,
        });
      res.json({ success: true, item: monitoredItem });
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Erro ao adicionar o item à lista monitorada" });
    }
  });

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
