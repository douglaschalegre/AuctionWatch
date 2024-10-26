import axios from 'axios'

// Função para consultar os leilões de um connected realm
export async function fetchAuctions(connectedRealmId, accessToken) {
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

// Função para buscar os leilões de um connected realm específico
export async function fetchAuctionsForRealm(connectedRealmId, accessToken) {
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