import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { SessionUser } from '../services/api';

type AuthContextValue = {
  isAuthenticated: boolean;
  user: SessionUser | null;
  login: (user: SessionUser) => void;
  register: (user: SessionUser) => void;
  logout: () => void;
};

const STORAGE_KEY = 'amline.session';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const rawSession = window.localStorage.getItem(STORAGE_KEY);
    if (!rawSession) {
      return;
    }

    try {
      setUser(JSON.parse(rawSession) as SessionUser);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function persist(nextUser: SessionUser | null) {
    setUser(nextUser);

    if (typeof window === 'undefined') {
      return;
    }

    if (nextUser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(user),
      user,
      login(nextUser) {
        persist(nextUser);
      },
      register(nextUser) {
        persist(nextUser);
      },
      logout() {
        persist(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider.');
  }

  return context;
}
