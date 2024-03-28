
const BACK_URL = import.meta.env.VITE_BACK_URL || 'http://localhost:3000';

async function refreshToken(): Promise<string | null> {
  const refresh_token = sessionStorage.getItem('refreshToken');
  if (!refresh_token) return null;

  try {
    const response = await fetch(`${BACK_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token }),
    });

    if (!response.ok) {
      console.error('Failed to refresh token');
      return null;
    }

    const data = await response.json();
    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('refreshToken', data.refreshToken);
    return data.accessToken;
  } catch (error) {
    console.error('Error during token refresh', error);
    return null;
  }
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}, attemptRefresh = true): Promise<Response> {
  const accessToken = sessionStorage.getItem('accessToken');
  
  const response = await fetch(`${BACK_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401 && attemptRefresh) {
    const didRefresh = await refreshToken();
    if (didRefresh) {
      return fetchWithAuth(endpoint, options, false);
    } else {
      throw new Error('Session expired. Please login again.');
    }
  }

  return response;
}

export default fetchWithAuth;
