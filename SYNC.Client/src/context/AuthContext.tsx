import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

import type { User } from '../types/user';
import { login as loginApi, type LoginCredentials } from '../api/auth';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('sync-user');

    return savedUser ? JSON.parse(savedUser) : null;
  });

  async function login(credentials: LoginCredentials) {
    const loggedUser = await loginApi(credentials);

    setUser(loggedUser);
    localStorage.setItem('sync-user', JSON.stringify(loggedUser));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('sync-user');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}