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
        'X-PINCODE': otpCode, // O código OTP vai aqui
        'X-CHANNEL': 'WEB',
        'X-APP-VERSION': '3.1.07',
      },
      body: JSON.stringify({ token: otpCode }), // E aqui também
    });

    if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        return res.status(apiResponse.status).json(errorData);
    }
    
    // Se a validação foi bem-sucedida, a API do Prezão retorna o token de autorização
    const responseData = await apiResponse.json();
    
    // O token JWT provavelmente está dentro de 'responseData'. Inspecione a resposta real.
    // Supondo que a resposta seja algo como { token: "ey..." }
    const authToken = responseData.token; // Ajuste isso conforme a resposta real da API

    res.status(200).json({ 
        message: 'Login realizado com sucesso!', 
        authorizationToken: authToken 
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro interno no servidor', error: error.message });
  }
}
