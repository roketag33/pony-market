export const useAuth = () => {
    const userToken = localStorage.getItem('token');
    return {
      isAuthenticated: !!userToken,
    };
  };
  