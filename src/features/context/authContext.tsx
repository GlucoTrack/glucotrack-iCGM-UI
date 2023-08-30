
import { createContext, useContext, ReactNode, useState } from 'react';

interface AuthContextInterface {
  role: string;
  setRole: React.Dispatch<React.SetStateAction<string>>;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  sessionToken: string;
  setSessionToken: React.Dispatch<React.SetStateAction<string>>; 
}

const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [sessionToken, setSessionToken] = useState<string>('');

  // const logout = () => {
  //   setRole('');
  //   setUsername('');
  // };

  return (
    <AuthContext.Provider value={{ role, setRole, username, setUsername, sessionToken, setSessionToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('Authentication must be used with an AuthProvider');
  }
  return context;
}
