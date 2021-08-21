import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { FirebaseGithubAuthProvider } from "./auth";
import { PageContext, PAGE_QUERY_ARG } from "./page";
import { pageNames, Pages, toPageName, DEFAULT_PAGE } from "./pages";

const APP_ID = "app";

const appEl = document.getElementById(APP_ID);

if (!appEl) {
  throw new Error(`Unable to find #${APP_ID}!`);
}

function getWindowSearch(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

/**
 * Call the given handler whenever a `popstate` event
 * occurs.
 *
 * Return a function that wraps `window.history.pushState()`;
 * the given handler will be called immediately afterwards.
 */
function usePushState(onPushOrPopState: () => void) {
  useEffect(() => {
    window.addEventListener("popstate", onPushOrPopState);
    return () => {
      window.removeEventListener("popstate", onPushOrPopState);
    };
  }, [onPushOrPopState]);

  return useCallback(
    function pushState(href: string) {
      window.history.pushState(null, "", href);
      onPushOrPopState();
    },
    [onPushOrPopState]
  );
}

const App: React.FC<{}> = (props) => {
  const [search, setSearch] = useState(getWindowSearch());
  const updateSearchFromWindow = useCallback(
    () => setSearch(getWindowSearch()),
    []
  );
  const currPage = toPageName(search.get(PAGE_QUERY_ARG) || "", DEFAULT_PAGE);
  const PageComponent = Pages[currPage];
  const pushState = usePushState(updateSearchFromWindow);
  const ctx: PageContext = {
    search,
    currPage,
    allPages: pageNames,
    pushState,
  };

  return (
    <FirebaseGithubAuthProvider>
      <PageContext.Provider value={ctx}>
        <PageComponent />
      </PageContext.Provider>
    </FirebaseGithubAuthProvider>
  );
};

ReactDOM.render(<App />, appEl);
