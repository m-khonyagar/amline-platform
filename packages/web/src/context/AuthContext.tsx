import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { logoutSession, refreshAuthSession, type SessionUser } from '../services/api';
import { canAccessPath, defaultRouteForRole } from '../lib/auth';

type AuthContextValue = {
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  user: SessionUser | null;
  login: (user: SessionUser) => void;
  register: (user: SessionUser) => void;
  logout: () => void;
  canAccess: (pathname: string) => boolean;
  landingPath: string;
};

const STORAGE_KEY = 'amline.session';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsBootstrapping(false);
      return;
    }

    const rawSession = window.localStorage.getItem(STORAGE_KEY);
    if (!rawSession) {
      setIsBootstrapping(false);
      return;
    }

    try {
      const parsed = JSON.parse(rawSession) as SessionUser;
      setUser(parsed);

      if (!parsed.refreshToken) {
        setIsBootstrapping(false);
        return;
      }

      void refreshAuthSession(parsed.refreshToken)
        .then((tokens) => {
          const nextUser = {
            ...parsed,
            accessToken: tokens.token,
            refreshToken: tokens.refreshToken,
          };
          setUser(nextUser);
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
        })
        .catch(() => {
          setUser(null);
          window.localStorage.removeItem(STORAGE_KEY);
        })
        .finally(() => {
          setIsBootstrapping(false);
        });
      return;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    setIsBootstrapping(false);
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
      isBootstrapping,
      isAuthenticated: Boolean(user),
      user,
      login(nextUser) {
        persist(nextUser);
      },
      register(nextUser) {
        persist(nextUser);
      },
      logout() {
        void logoutSession(user?.accessToken, user?.refreshToken);
        persist(null);
      },
      canAccess(pathname) {
        return canAccessPath(user?.role, pathname);
      },
      landingPath: defaultRouteForRole(user?.role),
    }),
    [isBootstrapping, user],
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
