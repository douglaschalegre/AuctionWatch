import dotenv from 'dotenv'
import express from 'express'
import axios from 'axios'
dotenv.config();

const app = express();
const PORT = 3000;
const BNET_API_URL = "https://us.api.blizzard.com/data/wow";
let accessToken = null;
import {MAX_PARALLEL_REQUESTS, processInBatches, WOW_GOLD_CAP} from './utils.js'
// Função para obter o token de acesso da API da Battle.net
async function getAccessToken() {
    const { BNET_CLIENT_ID, BNET_CLIENT_SECRET } = process.env;
    try {
        const response = await axios.post('https://us.battle.net/oauth/token', null, {
            params: {
                grant_type: 'client_credentials'
            },
            auth: {
                username: BNET_CLIENT_ID,
                password: BNET_CLIENT_SECRET
            }
        });
        accessToken = response.data.access_token;
        console.log("Access token obtido com sucesso!");
    } catch (error) {
        console.error("Erro ao obter o token de acesso:", error);
    }
}

// Função para buscar todos os connected realms
async function fetchConnectedRealms() {
    if (!accessToken) await getAccessToken();
    try {
        const response = await axios.get(`${BNET_API_URL}/connected-realm/index`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            params: { namespace: 'dynamic-us', locale: 'en_US' }
        });
        // Extrai os IDs de cada connected realm
        return response.data.connected_realms.map(realm => realm.href.split('/').pop().split('?')[0]);
    } catch (error) {
        console.error("Erro ao buscar connected realms:", error.message);
    }
}

// Função para consultar os leilões de um connected realm
async function fetchAuctions(connectedRealmId) {
    if (!accessToken) await getAccessToken();
    try {
        const response = await axios.get(`${BNET_API_URL}/connected-realm/${connectedRealmId}/auctions`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar leilões:", error.response ? error.response.data : error.message);
        // Tenta renovar o token de acesso em caso de erro de autenticação
        if (error.response && error.response.status === 401) {
            await getAccessToken();
            return fetchAuctions(connectedRealmId); // Tenta novamente com o novo token
        }
    }
}

// Configura a rota para obter leilões
app.get('/auctions/:connectedRealmId', async (req, res) => {
    const { connectedRealmId } = req.params;
    const data = await fetchAuctions(connectedRealmId);
    if (data) {
        res.json(data);
    } else {
        res.status(500).send("Erro ao obter os dados de leilões.");
    }
});

// Função para buscar os leilões de um connected realm específico
async function fetchAuctionsForRealm(connectedRealmId) {
    try {
        const response = await axios.get(`${BNET_API_URL}/connected-realm/${connectedRealmId}/auctions`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            params: {'namespace': 'dynamic-us', ':region': 'us'}
        });
        return response.data.auctions;
    } catch (error) {
        console.error(`Erro ao buscar leilões para o connected realm ${connectedRealmId}:`, error.message);
    }
}

// Função para buscar informações de um item específico em todos os realms
async function fetchItemInAllRealms(itemId) {
    const realms = await fetchConnectedRealms();
    const itemData = [];
    let cheapestItemValue = WOW_GOLD_CAP
    let expensiestItemValue = 0
    let cheapestItemServer = null
    let expensiestItemServer = null

    // Função para verificar se o item tem o menor ou maior valor encontrado até agora
    function checkIfItemHasExtremeValue(auction, realmId, itemId) {
        if (auction.item.id === parseInt(itemId)){
            if (auction.buyout < cheapestItemValue){
                cheapestItemValue = auction.buyout;
                cheapestItemServer = realmId;
            } else if (auction.buyout > expensiestItemValue){
                expensiestItemValue = auction.buyout;
                expensiestItemServer = realmId;
            }

            console.log(`O item mais caro até agora custa ${expensiestItemValue} e é do servidor ${expensiestItemServer}`)
            console.log(`O item mais barato até agora custa ${cheapestItemValue} e é do servidor ${cheapestItemServer}`)
            return true
        }
    }

    // Itera sobre cada connected realm e busca os leilões para o item
    // Processa os realms em lotes de no máximo MAX_PARALLEL_REQUESTS
    await processInBatches(realms, MAX_PARALLEL_REQUESTS, async (realmId) => {
        const auctions = await fetchAuctionsForRealm(realmId);
        const itemAuctions = auctions.filter(auction => (checkIfItemHasExtremeValue(auction, realmId, itemId)));
        
        if (itemAuctions.length > 0) {
            itemData.push({
                connectedRealmId: realmId,
                auctions: itemAuctions
            });
        }
    });
    return {
        'itemData': itemData,
        'cheapestItem': {'server': cheapestItemServer, 'value': cheapestItemValue},
        'expensiestItem': {'server': expensiestItemServer, 'value': expensiestItemValue}
    };
}
// Endpoint para consultar informações do item em todos os connected realms
app.get('/item-auctions/:itemId', async (req, res) => {
    const { itemId } = req.params;
    const data = await fetchItemInAllRealms(itemId);
    if (data.itemData.length > 0) {
        res.json(data);
    } else {
        res.status(404).send("Item não encontrado em nenhum connected realm.");
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
