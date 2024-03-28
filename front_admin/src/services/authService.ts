const BACK_URL = import.meta.env.VITE_BACK_URL


export const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    return decodedToken.exp < now;
  };

  export const refreshToken = async (): Promise<void> => {
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (!refreshToken || isTokenExpired(refreshToken)) {
      logout();
    } else {
      try {
        const response = await fetch(`${BACK_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!response.ok) throw new Error('Failed to refresh token');
        const data = await response.json();
        sessionStorage.setItem('accessToken', data.access_token);
        sessionStorage.setItem('refreshToken', data.refresh_token);
      } catch (error) {
        console.error('Error refreshing token:', error);
        logout();
      }
    }
  };
  
  export const logout = (): void => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };
  