// /api/verify-code.js

// (A função findJwt continua a mesma)
function findJwt(obj) {
    for (const key in obj) {
        if (typeof obj[key] === 'string' && obj[key].startsWith('ey')) return obj[key];
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            const found = findJwt(obj[key]);
            if (found) return found;
        }
    }
    return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { phoneNumber, otpCode } = req.body;
  if (!phoneNumber || !otpCode) return res.status(400).json({ message: 'Dados incompletos.' });
  
  const PREZAO_API_URL = 'https://api.prezaofree.com.br/39dd54c0-9ea1-4708-a9c5-5120810b3b72/vapi';

  try {
    const apiResponse = await fetch(PREZAO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-USER-ID': phoneNumber,
        'X-PINCODE': otpCode,
        'X-CHANNEL': 'WEB',
        'X-APP-VERSION': '3.1.07' // <--- CORREÇÃO ADICIONADA AQUI
      },
      body: JSON.stringify({ token: otpCode }),
    });
    
    const responseData = await apiResponse.json();
    if (!apiResponse.ok) {
        // Agora o erro que você viu será repassado para a tela
        return res.status(apiResponse.status).json({ message: responseData.message || 'Erro da API do Prezão', details: responseData });
    }
    
    const authToken = findJwt(responseData);
    if (!authToken) {
      return res.status(404).json({ message: 'Login OK, mas o token não foi encontrado na resposta.', details: responseData });
    }

    res.status(200).json({ authorizationToken: authToken });

  } catch (error) {
    res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
}
