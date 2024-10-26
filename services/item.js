import {MAX_PARALLEL_REQUESTS, processInBatches, WOW_GOLD_CAP} from './utils.js'
import { fetchConnectedRealms } from '../consumers/realm.js';
import { fetchAuctionsForRealm } from '../consumers/auctions.js';

// Função para buscar informações de um item específico em todos os realms
export async function fetchItemInAllRealms(itemId, accessToken) {
    const realms = await fetchConnectedRealms(accessToken);
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
        const auctions = await fetchAuctionsForRealm(realmId, accessToken);
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