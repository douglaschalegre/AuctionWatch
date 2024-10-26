import axios from 'axios';

export async function fetchItemInfo(itemId, accessToken) {
  try {
    const response = await axios.get(
      `${BNET_API_URL}/item/${itemId}`,
      {
        params: {
          namespace: 'static-us',
          locale: 'en_US',
          access_token: accessToken
        }
      }
    );
    const { name, description, level: item_level } = response.data;
    return { name, description, item_level };
  } catch (error) {
    console.error("Erro ao buscar informações do item:", error);
  }
}