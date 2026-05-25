'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { auth, initPersistence } from '@/lib/firebase';
import { getUserRole } from '@/lib/getUserRole';

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  login: async () => '',
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initPersistence();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const fetchedRole = await getUserRole(firebaseUser.uid);
        setRole(fetchedRole);
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  /**
   * Logs in and returns the user's role so the login page
   * can redirect immediately without waiting for onAuthStateChanged.
   */
  const login = async (email: string, password: string): Promise<string> => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const fetchedRole = await getUserRole(credential.user.uid);
    setUser(credential.user);
    setRole(fetchedRole);
    return fetchedRole ?? '';
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);