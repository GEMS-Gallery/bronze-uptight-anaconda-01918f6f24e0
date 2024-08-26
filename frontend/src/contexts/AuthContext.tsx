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

  const login = async () => {
    const client = authClient || await AuthClient.create();
    const isLocalNetwork = process.env.DFX_NETWORK !== "ic";
    const identityProviderUrl = isLocalNetwork
      ? `http://${process.env.INTERNET_IDENTITY_CANISTER_ID}.localhost:8000`
      : "https://identity.ic0.app";

    await client.login({
      identityProvider: identityProviderUrl,
      onSuccess: async () => {
        setAuthClient(client);
        setIsAuthenticated(true);
        const identity = client.getIdentity();
        const principal = identity.getPrincipal();
        setPrincipal(principal);
      },
    });
  };

  const logout = async () => {
    if (authClient) {
      await authClient.logout();
      setIsAuthenticated(false);
      setPrincipal(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, principal, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
