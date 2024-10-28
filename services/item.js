import {MAX_PARALLEL_REQUESTS, processInBatches, WOW_GOLD_CAP} from '../utils.js'
import { fetchConnectedRealms } from '../consumers/realm.js';
import { fetchAuctionsForRealm } from '../consumers/auctions.js';
import { findMonitoredItems } from '../repositories/monitoredItems.js'

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
            console.log('Found relevant item! Calculating if is cheaper or expensier')
            if (auction.buyout < cheapestItemValue){
                cheapestItemValue = auction.buyout;
                cheapestItemServer = realmId;
            } else if (auction.buyout > expensiestItemValue){
                expensiestItemValue = auction.buyout;
                expensiestItemServer = realmId;
            }

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

// Função para buscar informações de items monitorados em todos os realms
export async function fetchMonitoredItemsInAllRealms(accessToken) {
    const itemsIds = await findMonitoredItems().map(item => item.itemId)
    console.log(itemsIds)
    const realms = await fetchConnectedRealms(accessToken);
    let itemMap = {}
    itemsIds.forEach((itemId) => itemMap[itemId] = {
        cheapestItemValue: WOW_GOLD_CAP,
        expensiestItemValue: 0,
        cheapestItemServer: null,
        expensiestItemServer: null
    })

    // Função para verificar se o item tem o menor ou maior valor encontrado até agora
    function checkForExtremeValueItem(auction, realmId, itemsIds) {
        console.log(auction.item.id, itemsIds)
        if (itemsIds.includes(auction.item.id)){
            console.log('Found relevant item! Calculating if is cheaper or expensier')
            if (auction.buyout < itemsIds[auction.item.id].cheapestItemValue){
                itemsIds[auction.item.id].cheapestItemValue = auction.buyout;
                itemsIds[auction.item.id].cheapestItemServer = realmId;
            } else if (auction.buyout > itemsIds[auction.item.id].expensiestItemValue){
                itemsIds[auction.item.id].expensiestItemValue = auction.buyout;
                itemsIds[auction.item.id].expensiestItemServer = realmId;
            }
            return true
        }
    }

    // Itera sobre cada connected realm e busca os leilões para o item
    // Processa os realms em lotes de no máximo MAX_PARALLEL_REQUESTS
    await processInBatches(realms, MAX_PARALLEL_REQUESTS, async (realmId) => {
        const auctions = await fetchAuctionsForRealm(realmId, accessToken);
        const itemAuctions = auctions.filter(auction => (checkForExtremeValueItem(auction, realmId, itemsIds)));
        
        if (itemAuctions.length > 0) {
            itemData.push({
                connectedRealmId: realmId,
                auctions: itemAuctions
            });
        }
    });

    let cheapests = {}
    let expensiest = {}
    function calculateExtremes(cheapests, expensiest, item){
        cheapests[item] = {'server': item.cheapestItemServer, 'value': item.cheapestItemValue};
        expensiest[item] = {'server': item.expensiestItemServer, 'value': item.expensiestItemValue};
    }
    
    itemMap.forEach(item => calculateExtremes(cheapests, expensiest, item))
    return {
        'itemData': itemMap,
        'cheapests': cheapests,
        'expensiest': expensiest
    };
}