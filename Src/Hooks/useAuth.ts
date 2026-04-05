import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { syncUserProfile } from '../services/userProfileService';
import {
  removeFromLocalStorage,
  retrieveFromLocalStorage,
  storeInLocalStorage,
} from '../Utility/SecureStore';
import { WEB_CLIENT_ID } from '../config/apiKeys';

type AuthUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signingIn: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_SESSION_KEY = 'auth_session';

function createAuthSnapshot(
  user: Pick<
    FirebaseAuthTypes.User,
    'uid' | 'displayName' | 'email' | 'photoURL'
  >,
): AuthUser {
  return {
    uid: user.uid,
    displayName: user.displayName ?? null,
    email: user.email ?? null,
    photoURL: user.photoURL ?? null,
  };
}

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSigningOutRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    retrieveFromLocalStorage(AUTH_SESSION_KEY).then(storedSession => {
      if (!isMounted) {
        return;
      }

      if (storedSession?.uid) {
        setUser(storedSession as AuthUser);
      }

      setLoading(false);
    });

    const unsubscribe = auth().onAuthStateChanged(async currentUser => {
      if (!isMounted) {
        return;
      }

      if (currentUser) {
        isSigningOutRef.current = false;

        try {
          await syncUserProfile(currentUser);
        } catch {
          setError('Something went wrong. Please try again later.');
        }

        const snapshot = createAuthSnapshot(currentUser);
        setUser(snapshot);
        await storeInLocalStorage(AUTH_SESSION_KEY, snapshot);
      } else {
        if (isSigningOutRef.current) {
          setUser(null);
          setLoading(false);
          return;
        }

        const storedSession = await retrieveFromLocalStorage(AUTH_SESSION_KEY);
        setUser(storedSession?.uid ? (storedSession as AuthUser) : null);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    setSigningIn(true);
    setError(null);

    try {
      await GoogleSignin.hasPlayServices();

      const result: any = await GoogleSignin.signIn();
      const idToken = result?.data?.idToken ?? result?.idToken;

      if (!idToken) {
        throw new Error('Missing Google ID token.');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
    } catch (e: any) {
      if (e.code === statusCodes.SIGN_IN_CANCELLED) {
        setError('Sign-in was cancelled.');
      } else if (e.code === statusCodes.IN_PROGRESS) {
        setError('Sign-in is already in progress.');
      } else if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play Services are not available.');
      } else {
        setError(e?.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const signOut = async () => {
    setError(null);
    isSigningOutRef.current = true;

    try {
      if (await GoogleSignin.hasPreviousSignIn()) {
        await GoogleSignin.signOut();
      }
    } catch {
      // Firebase sign-out should still proceed even if Google session cleanup fails.
    }

    try {
      await auth().signOut();
      await removeFromLocalStorage(AUTH_SESSION_KEY);
      setUser(null);
    } catch (e: any) {
      isSigningOutRef.current = false;
      setError(e?.message || 'Sign-out failed. Please try again.');
      throw e;
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      signingIn,
      error,
      signInWithGoogle,
      signOut,
    }),
    [error, loading, signingIn, user],
  );

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
