// /api/complete-task.js

async function sendTaskEvent(eventType, campaignId, authToken, accessToken) {
    const url = `https://api.prezaofree.com.br/39dd54c0-9ea1-4708-a9c5-5120810b3b72/adserver/tracker?e=${eventType}&c=${campaignId}&u=32f1bb0f72f50&requestId=b379363c-5d6f-4a92-b074-1bcd6847dc4b`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CHANNEL': 'WEB',
            'X-AUTHORIZATION': authToken,
            'x-access-token': accessToken,
            'X-ARTEMIS-CHANNEL-UUID': 'cfree-b22d-4079-bca5-96359b6b1f57',
            'X-APP-VERSION': '3.1.07' // <--- CORREÇÃO ADICIONADA AQUI
        },
        body: null
    });
    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Falha no evento ${eventType}. Status: ${response.status}. Resposta: ${errorData}`);
    }
    return await response.json().catch(() => response.text());
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { authorizationToken, campaignId } = req.body;
    const X_ACCESS_TOKEN = "4e82abb4-2718-4d65-bcd4-c4e147c3404f";

    if (!authorizationToken || !campaignId) {
        return res.status(400).json({ message: 'Token e ID da campanha são obrigatórios.' });
    }
    try {
        await sendTaskEvent('impression', campaignId, authorizationToken, X_ACCESS_TOKEN);
        await new Promise(resolve => setTimeout(resolve, 500));
        const clickResponse = await sendTaskEvent('click', campaignId, authorizationToken, X_ACCESS_TOKEN);
        res.status(200).json({ message: `Tarefa ${campaignId} concluída.`, response: clickResponse });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
