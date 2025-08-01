// /api/verify-code.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Apenas o método POST é permitido' });
  }

  const { phoneNumber, otpCode } = req.body;

  if (!phoneNumber || !otpCode) {
    return res.status(400).json({ message: 'Número de telefone e código OTP são obrigatórios' });
  }

  const PREZAO_API_URL = 'https://api.prezaofree.com.br/39dd54c0-9ea1-4708-a9c5-5120810b3b72/vapi';

  try {
    const apiResponse = await fetch(PREZAO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-USER-ID': phoneNumber,
        'X-PINCODE': otpCode,
        'X-CHANNEL': 'WEB',
        'X-APP-VERSION': '3.1.07',
      },
      body: JSON.stringify({ token: otpCode }),
    });
    
    // Pega a resposta da API do Prezão
    const responseData = await apiResponse.json();

    if (!apiResponse.ok) {
      // Se a resposta for um erro, envia a mensagem de erro para o front-end
      return res.status(apiResponse.status).json({ message: responseData.message || 'Erro da API do Prezão', details: responseData });
    }
    
    // **LÓGICA MELHORADA PARA ENCONTRAR O TOKEN**
    // A API pode retornar o token em campos com nomes diferentes. Vamos procurar em alguns lugares comuns.
    let authToken = null;
    if (responseData.token) {
      authToken = responseData.token;
    } else if (responseData.authorization) {
      authToken = responseData.authorization;
    } else if (responseData.accessToken) {
      authToken = responseData.accessToken;
    } else if (responseData.data && responseData.data.token) {
      authToken = responseData.data.token;
    }

    if (!authToken) {
      // Se ainda assim não encontrar o token, retorna um erro claro
      console.error("Token não foi encontrado na resposta da API do Prezão. Resposta recebida:", responseData);
      return res.status(500).json({ message: 'Login OK, mas o token não foi encontrado na resposta da API.', details: responseData });
    }

    // Se encontrou o token, envia para o front-end
    res.status(200).json({ 
        message: 'Login realizado com sucesso!', 
        authorizationToken: authToken 
    });

  } catch (error) {
    console.error("Erro ao verificar código:", error);
    res.status(500).json({ message: 'Erro interno no servidor ao verificar código.', error: error.message });
  }
}
