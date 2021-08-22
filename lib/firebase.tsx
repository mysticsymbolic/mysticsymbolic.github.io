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
import {
  FirebaseFirestore,
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  CollectionReference,
  Timestamp,
} from "firebase/firestore";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "./auth-context";
import { GalleryComposition, GalleryContext } from "./gallery-context";

const GALLERY_COLLECTION = "compositions";

const DEFAULT_APP_CONFIG: FirebaseOptions = {
  apiKey: "AIzaSyAV1kkVvSKEicEa8rLke9o_BxYBu1rb8kw",
  authDomain: "mystic-addaf.firebaseapp.com",
  projectId: "mystic-addaf",
  storageBucket: "mystic-addaf.appspot.com",
  messagingSenderId: "26787182745",
  appId: "1:26787182745:web:e4fbd9439b9279fe966008",
  measurementId: "G-JHKRSK1PR6",
};

type FirebaseAppContext = {
  app: FirebaseApp;
  auth: Auth;
  provider: GithubAuthProvider;
  db: FirebaseFirestore;
};

export const FirebaseAppContext =
  React.createContext<FirebaseAppContext | null>(null);

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
  const [value, setValue] = useState<FirebaseAppContext | null>(null);

  useEffect(() => {
    const app = initializeApp(config || DEFAULT_APP_CONFIG);
    const auth = getAuth(app);
    const provider = new GithubAuthProvider();
    const db = getFirestore(app);

    setValue({ app, auth, provider, db });
  }, [config]);

  return <FirebaseAppContext.Provider value={value} children={children} />;
};

/**
 * A Firebase GitHub authentication provider.  Must be a child of a
 * `FirebaseAppProvider`.
 *
 * Note this component is assumed to never be unmounted.
 */
export const FirebaseGithubAuthProvider: React.FC<{}> = ({ children }) => {
  const appCtx = useContext(FirebaseAppContext);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleError = (e: Error) => setError(e.message);

  useEffect(() => {
    if (!appCtx) return;

    onAuthStateChanged(appCtx.auth, setUser);
  }, [appCtx]);

  const context: AuthContext = {
    loggedInUser: user && user.displayName,
    providerName: appCtx && "GitHub",
    error,
    login: useCallback(() => {
      setError(undefined);
      appCtx &&
        signInWithPopup(appCtx.auth, appCtx.provider).catch(handleError);
    }, [appCtx]),
    logout: useCallback(() => {
      setError(undefined);
      appCtx && signOut(appCtx.auth).catch(handleError);
    }, [appCtx]),
  };

  return <AuthContext.Provider value={context} children={children} />;
};

type FirebaseCompositionDocument = Omit<
  GalleryComposition,
  "id" | "createdAt"
> & {
  createdAt: Timestamp;
};

function getGalleryCollection(appCtx: FirebaseAppContext) {
  return collection(
    appCtx.db,
    GALLERY_COLLECTION
  ) as CollectionReference<FirebaseCompositionDocument>;
}

export const FirebaseGalleryProvider: React.FC<{}> = ({ children }) => {
  const appCtx = useContext(FirebaseAppContext);
  const [compositions, setCompositions] = useState<GalleryComposition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [lastRefresh, setLastRefresh] = useState(0);

  const handleError = (e: Error) => {
    setIsLoading(false);
    setError(e.message);
  };

  const context: GalleryContext = {
    compositions,
    isLoading,
    error,
    lastRefresh,
    refresh: useCallback(() => {
      if (!(appCtx && !isLoading)) return false;

      setError(undefined);
      setIsLoading(true);
      getDocs(query(getGalleryCollection(appCtx), orderBy("createdAt", "desc")))
        .then((snapshot) => {
          setLastRefresh(Date.now());
          setIsLoading(false);
          setCompositions(
            snapshot.docs.map((doc) => {
              const { createdAt, ...data } = doc.data();
              return {
                ...data,
                id: doc.id,
                createdAt: createdAt.toDate(),
              };
            })
          );
        })
        .catch(handleError);
      return true;
    }, [appCtx, isLoading]),
  };

  return <GalleryContext.Provider value={context} children={children} />;
};
