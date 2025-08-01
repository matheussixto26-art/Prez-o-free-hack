// /api/complete-task.js

// Função auxiliar para evitar repetição de código
async function sendTaskEvent(eventType, campaignId, authToken, accessToken) {
    // Monta a URL com os parâmetros corretos
    const url = `https://api.prezaofree.com.br/39dd54c0-9ea1-4708-a9c5-5120810b3b72/adserver/tracker?e=${eventType}&c=${campaignId}&u=32f1bb0f72f50&requestId=b379363c-5d6f-4a92-b074-1bcd6847dc4b`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CHANNEL': 'WEB',
            'X-AUTHORIZATION': authToken, // O token de login do usuário
            'x-access-token': accessToken, // O token de acesso que você capturou
            // Adicione outros headers que parecem estáticos, se necessário
            'X-ARTEMIS-CHANNEL-UUID': 'cfree-b22d-4079-bca5-96359b6b1f57'
        },
        body: null // O corpo da requisição é vazio (Content-Length: 0)
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Falha no evento ${eventType} para a campanha ${campaignId}. Status: ${response.status}. Resposta: ${errorData}`);
    }

    return await response.text(); // Retorna a resposta (geralmente vazia)
}


export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido.' });
    }

    const { authorizationToken, campaignId } = req.body;
    
    // Este é o token que parece ser fixo nas suas requisições.
    // Se ele mudar, precisaremos descobrir como obtê-lo dinamicamente.
    const X_ACCESS_TOKEN = "4e82abb4-2718-4d65-bcd4-c4e147c3404f";

    if (!authorizationToken || !campaignId) {
        return res.status(400).json({ message: 'Token de autorização e ID da campanha são obrigatórios.' });
    }

    try {
        // Passo 1: Enviar o evento de "impression" (visualização)
        console.log(`Enviando evento 'impression' para a campanha: ${campaignId}`);
        await sendTaskEvent('impression', campaignId, authorizationToken, X_ACCESS_TOKEN);

        // Uma pequena pausa para simular o comportamento humano
        await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 segundos de pausa

        // Passo 2: Enviar o evento de "click" (conclusão)
        console.log(`Enviando evento 'click' para a campanha: ${campaignId}`);
        const clickResponse = await sendTaskEvent('click', campaignId, authorizationToken, X_ACCESS_TOKEN);

        res.status(200).json({ 
            message: `Tarefa ${campaignId} concluída com sucesso!`,
            response: clickResponse 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
      }
