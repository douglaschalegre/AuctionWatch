import axios from 'axios'
import {BNET_API_URL} from './config.js'

// Função para buscar todos os connected realms
export async function fetchConnectedRealms(accessToken) {
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