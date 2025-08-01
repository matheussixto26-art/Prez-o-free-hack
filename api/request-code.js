// /api/request-code.js

export default async function handler(req, res) {
  // Garante que o método é POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Apenas o método POST é permitido' });
  }

  // Pega o número de telefone do corpo da requisição
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: 'O número de telefone é obrigatório' });
  }

  // URL da API do Prezão Free para solicitar o código
  const PREZAO_API_URL = 'https://api.prezaofree.com.br/39dd54c0-9ea1-4708-a9c5-5120810b3b72/pnde';

  try {
    const apiResponse = await fetch(PREZAO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-USER-ID': phoneNumber,
        'X-CHANNEL': 'WEB',
        'X-APP-VERSION': '3.1.07', // Usando os headers que você capturou
        // Adicione outros headers se forem necessários
      },
      body: JSON.stringify({ msisdn: phoneNumber }),
    });

    // Se a API do Prezão Free não responder com sucesso, repassa o erro
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      return res.status(apiResponse.status).json(errorData);
    }
    
    // Se tudo deu certo
    res.status(200).json({ message: 'Código de verificação enviado com sucesso!' });

  } catch (error) {
    res.status(500).json({ message: 'Erro interno no servidor', error: error.message });
  }
}
  
