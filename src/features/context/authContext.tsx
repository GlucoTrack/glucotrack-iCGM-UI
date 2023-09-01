
import { createContext, useContext, ReactNode, useState } from 'react';

interface Permission {
  feature: string;
  levelOfAccess: string;
}

interface AuthContextInterface {
  role: string;
  setRole: React.Dispatch<React.SetStateAction<string>>;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  sessionToken: string;
  setSessionToken: React.Dispatch<React.SetStateAction<string>>; 
  permissions: Permission[];
  setPermissions: React.Dispatch<React.SetStateAction<Permission[]>>;
}

const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [sessionToken, setSessionToken] = useState<string>('');
  const [permissions, setPermissions] = useState<Permission[]>([]);

  return (
    <AuthContext.Provider value={{ role, setRole, username, setUsername, sessionToken, setSessionToken, permissions, setPermissions }}>
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
