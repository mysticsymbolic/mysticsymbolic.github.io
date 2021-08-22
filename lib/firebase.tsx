import { FirebaseApp, FirebaseOptions, initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GithubAuthProvider,
  onAuthStateChanged,
  signOut,
  Auth,
  User,
} from "firebase/auth";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "./auth-context";

const DEFAULT_APP_CONFIG: FirebaseOptions = {
  apiKey: "AIzaSyAV1kkVvSKEicEa8rLke9o_BxYBu1rb8kw",
  authDomain: "mystic-addaf.firebaseapp.com",
  projectId: "mystic-addaf",
  storageBucket: "mystic-addaf.appspot.com",
  messagingSenderId: "26787182745",
  appId: "1:26787182745:web:e4fbd9439b9279fe966008",
  measurementId: "G-JHKRSK1PR6",
};

type FirebaseGithubAuthState = {
  auth: Auth;
  provider: GithubAuthProvider;
};

export const FirebaseAppContext = React.createContext<FirebaseApp | null>(null);

/**
 * A Firebase app provider.  Any other components that use Firebase must
 * be a child of this.
 *
 * Note this component is assumed to never be unmounted, nor
 * for its non-children props to change.
 */
export const FirebaseAppProvider: React.FC<{ config?: FirebaseOptions }> = ({
  config,
  children,
}) => {
  const [app, setApp] = useState<FirebaseApp | null>(null);

  useEffect(() => {
    setApp(initializeApp(config || DEFAULT_APP_CONFIG));
  }, [config]);

  return <FirebaseAppContext.Provider value={app} children={children} />;
};

/**
 * A Firebase GitHub authentication provider.  Must be a child of a
 * `FirebaseAppProvider`.
 *
 * Note this component is assumed to never be unmounted.
 */
export const FirebaseGithubAuthProvider: React.FC<{}> = ({ children }) => {
  const app = useContext(FirebaseAppContext);
  const [state, setState] = useState<FirebaseGithubAuthState | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleError = (e: Error) => setError(e.message);

  useEffect(() => {
    if (!app) return;
    const auth = getAuth(app);
    const provider = new GithubAuthProvider();

    setState({ auth, provider });
    onAuthStateChanged(auth, setUser);
  }, [app]);

  const context: AuthContext = {
    loggedInUser: user && user.displayName,
    providerName: state && "GitHub",
    error,
    login: useCallback(() => {
      setError(undefined);
      state && signInWithPopup(state.auth, state.provider).catch(handleError);
    }, [state]),
    logout: useCallback(() => {
      setError(undefined);
      state && signOut(state.auth).catch(handleError);
    }, [state]),
  };

  return <AuthContext.Provider value={context} children={children} />;
};
