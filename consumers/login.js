import axios from 'axios'

/*
 Função para obter o token de acesso da API da Battle.net 
*/
export async function getAccessToken() {
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
        console.log("[*] Access token obtido com sucesso!");
        return response.data.access_token;
    } catch (error) {
        console.error("Erro ao obter o token de acesso:", error);
    }
}