
import { createContext, useContext, ReactNode, useState } from 'react';

interface AuthContextInterface {
  role: string;
  setRole: React.Dispatch<React.SetStateAction<string>>;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
}

const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<string>('');
  const [username, setUsername] = useState<string>('');

  return (
    <AuthContext.Provider value={{ role, setRole, username, setUsername }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('Authentication must be used with a AuthProvider');
  }
  return context;
}



//    In Components:
/*

import { useAuth } from '../context/authContext';

export function MyComponent() {
  const { role, username } = useAuth();

  // check if role is admin --> can call from 'useRole' hook... ('role' is parameter)

  function authenticateAdminRole() {
    return role === 'Administrator';
  }

  if (!authenticateAdminRole()) {
    return <p>Forbidden access - no permission to perform action</p>;
  }

  return (
    // Actual component content ...

    <div>
      <p>Welcome, {username}</p>
      // Rest of component...
    </div>
    
  );
}

*/
