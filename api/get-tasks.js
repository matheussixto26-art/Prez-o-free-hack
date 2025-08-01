// /api/get-tasks.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const { authorizationToken } = req.body;
    if (!authorizationToken) {
        return res.status(401).json({ message: 'Token de autorização é obrigatório.' });
    }

    const TASKS_API_URL = 'https://api.prezaofree.com.br/39dd54c0-9ea1-4708-a9c5-5120810b3b72/hmld';

    try {
        const response = await fetch(TASKS_API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTHORIZATION': authorizationToken, // Usa o token do usuário
                'X-CHANNEL': 'WEB',
                'X-APP-VERSION': '3.1.07'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ message: 'Erro ao buscar tarefas', details: errorData });
        }

        const tasksData = await response.json();
        res.status(200).json(tasksData);

    } catch (error) {
        res.status(500).json({ message: 'Erro interno do servidor ao buscar tarefas.', error: error.message });
    }
}
