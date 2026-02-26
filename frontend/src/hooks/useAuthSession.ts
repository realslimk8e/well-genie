import { useEffect, useState } from 'react';
import { apiClient } from '../lib/apiClient';

type AuthView = 'login' | 'signup';

export function useAuthSession() {
  const [authed, setAuthed] = useState<boolean>(false);
  const [authView, setAuthView] = useState<AuthView>('login');

  useEffect(() => {
    apiClient
      .get<{ username?: string }>('api/me')
      .then((response) => {
        if (response.status === 200 && response.data.username) {
          setAuthed(true);
        } else {
          setAuthed(false);
        }
      })
      .catch(() => {
        setAuthed(false);
      });
  }, []);

  const logout = () => {
    return apiClient
      .post('api/logout', {})
      .then(() => {
        setAuthed(false);
        setAuthView('login');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  };

  const loginSucceeded = () => {
    setAuthed(true);
    setAuthView('login');
  };

  const signupSucceeded = () => {
    setAuthed(true);
  };

  return {
    authed,
    authView,
    setAuthView,
    logout,
    loginSucceeded,
    signupSucceeded,
  };
}
