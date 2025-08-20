import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Ajout d'une interface pour l'utilisateur enregistré
interface RegisteredUser {
  id: string;
  email: string;
  name: string;
  password: string; // hashé ou en clair pour la démo
  role: string;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    // Initialisation des utilisateurs par défaut
    let users = [];
    const usersRaw = localStorage.getItem('registered_users');
    if (usersRaw) {
      users = JSON.parse(usersRaw);
    }
    
    // Ajout du compte admin par défaut si absent
    if (!users.find((u: any) => u.email === 'hisaac@smart2dservices.com')) {
      users.push({
        id: 'admin',
        email: 'hisaac@smart2dservices.com',
        name: 'Administrateur SMART2D',
        password: 'asymptote++',
        role: 'admin'
      });
    }
    
    // Ajout d'utilisateurs de démonstration
    const demoUsers = [
      {
        id: 'user1',
        email: 'user1@example.com',
        name: 'Utilisateur Standard',
        password: 'user123',
        role: 'user'
      },
      {
        id: 'user2',
        email: 'user2@example.com',
        name: 'Utilisateur Test',
        password: 'user456',
        role: 'user'
      },
      {
        id: 'analyst',
        email: 'analyst@example.com',
        name: 'Analyste Données',
        password: 'analyst789',
        role: 'user'
      }
    ];
    
    demoUsers.forEach(demoUser => {
      if (!users.find((u: any) => u.email === demoUser.email)) {
        users.push(demoUser);
      }
    });
    
    localStorage.setItem('registered_users', JSON.stringify(users));
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Récupérer la liste des utilisateurs enregistrés
      const usersRaw = localStorage.getItem('registered_users');
      let users: RegisteredUser[] = [];
      if (usersRaw) {
        users = JSON.parse(usersRaw);
      }
      
      // Chercher l'utilisateur correspondant
      const found = users.find(u => u.email === email && u.password === password);
      if (found) {
        const mockToken = 'mock_jwt_token_' + Date.now();
        localStorage.setItem('auth_token', mockToken);
        localStorage.setItem('user_data', JSON.stringify(found));
        setUser(found);
        return true;
      }
      
      // Support backward compatibilité pour les anciens comptes
      if (email === 'admin@oracle.com' && password === 'admin123') {
        const mockUser: User = {
          id: '1',
          email: 'admin@oracle.com',
          name: 'Administrateur Oracle',
          role: 'admin'
        };
        const mockToken = 'mock_jwt_token_' + Date.now();
        localStorage.setItem('auth_token', mockToken);
        localStorage.setItem('user_data', JSON.stringify(mockUser));
        setUser(mockUser);
        return true;
      }
      
      // Support pour l'ancien compte caasigovners@gmail.com
      if (email === 'caasigovners@gmail.com' && password === 'asymptote++') {
        const mockUser: User = {
          id: '2',
          email: 'caasigovners@gmail.com',
          name: 'Administrateur Legacy',
          role: 'admin'
        };
        const mockToken = 'mock_jwt_token_' + Date.now();
        localStorage.setItem('auth_token', mockToken);
        localStorage.setItem('user_data', JSON.stringify(mockUser));
        setUser(mockUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  // Déterminer si l'utilisateur est admin
  const isAdmin = user?.email === 'hisaac@smart2dservices.com' || user?.role === 'admin';

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};