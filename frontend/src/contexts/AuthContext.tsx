import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

interface AuthContextType {
  isAuthenticated: boolean;
  principal: Principal | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);

  useEffect(() => {
    AuthClient.create().then(async (client) => {
      setAuthClient(client);
      const isAuthenticated = await client.isAuthenticated();
      setIsAuthenticated(isAuthenticated);
      if (isAuthenticated) {
        const principal = await client.getIdentity().getPrincipal();
        setPrincipal(principal);
      }
    });
  }, []);

  const login = () => {
    authClient?.login({
      identityProvider: process.env.DFX_NETWORK === 'ic' ? 'https://identity.ic0.app' : 'http://localhost:8000?canisterId=rwlgt-iiaaa-aaaaa-aaaaa-cai',
      onSuccess: async () => {
        setIsAuthenticated(true);
        const principal = await authClient.getIdentity().getPrincipal();
        setPrincipal(principal);
      },
    });
  };

  const logout = () => {
    authClient?.logout().then(() => {
      setIsAuthenticated(false);
      setPrincipal(null);
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, principal, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
