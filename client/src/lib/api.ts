const API_BASE_URL = 'http://localhost:3001';

export async function apiRequest(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`;
  
  // Set default headers
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Necessário para cookies HttpOnly
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = 'Ocorreu um erro na requisição.';
    try {
      const data = await response.json();
      errorMessage = data.message || data.errors?.[0]?.message || errorMessage;
    } catch {
      // Ignorar se a resposta não for JSON
    }
    throw new Error(errorMessage);
  }

  // Retornar JSON se houver conteúdo, senão retornar nulo
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return null;
}
