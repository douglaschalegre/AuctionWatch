export const MAX_PARALLEL_REQUESTS = 5; // Limite de requisições paralelas
export const WOW_GOLD_CAP = 10000000000
// Função auxiliar para processar promessas em lotes
export async function processInBatches(items, batchSize, callback) {
    let results = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(callback));
        results = results.concat(batchResults);
    }
    return results;
}