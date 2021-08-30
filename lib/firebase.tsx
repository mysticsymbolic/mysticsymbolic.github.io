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
  addDoc,
} from "firebase/firestore";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "./auth-context";
import {
  GalleryComposition,
  GalleryContext,
  GallerySubmitStatus,
} from "./gallery-context";

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
    loggedInUser: user && {
      id: user.uid,
      name: user.displayName || `GitHub user ${user.uid}`,
    },
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

function docToComp(
  doc: FirebaseCompositionDocument,
  id: string
): GalleryComposition {
  const { createdAt, ...data } = doc;
  return {
    ...data,
    id,
    createdAt: createdAt.toDate(),
  };
}

export const FirebaseGalleryProvider: React.FC<{}> = ({ children }) => {
  const appCtx = useContext(FirebaseAppContext);
  const [compositions, setCompositions] = useState<GalleryComposition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [lastRefresh, setLastRefresh] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<GallerySubmitStatus>("idle");
  const [lastSubmission, setLastSubmission] = useState<
    GalleryComposition | undefined
  >(undefined);

  const context: GalleryContext = {
    compositions,
    isLoading,
    error,
    lastRefresh,
    lastSubmission,
    submitStatus,
    submit(props) {
      if (!(appCtx && submitStatus === "idle")) return;

      const doc: FirebaseCompositionDocument = {
        ...props,
        createdAt: Timestamp.now(),
      };

      setSubmitStatus("submitting");
      setLastSubmission(undefined);
      addDoc(getGalleryCollection(appCtx), doc)
        .then((docRef) => {
          const comp = docToComp(doc, docRef.id);
          setSubmitStatus("idle");
          setCompositions([comp, ...compositions]);
          setLastSubmission(comp);
        })
        .catch((e) => {
          setSubmitStatus("error");
          console.log(e);
        });
    },
    refresh: useCallback(() => {
      if (!(appCtx && !isLoading)) return false;

      setError(undefined);
      setIsLoading(true);
      getDocs(query(getGalleryCollection(appCtx), orderBy("createdAt", "desc")))
        .then((snapshot) => {
          setLastRefresh(Date.now());
          setIsLoading(false);
          setCompositions(
            snapshot.docs.map((doc) => docToComp(doc.data(), doc.id))
          );
        })
        .catch((e) => {
          setIsLoading(false);
          setError(e.message);
        });
      return true;
    }, [appCtx, isLoading]),
  };

  return <GalleryContext.Provider value={context} children={children} />;
};
