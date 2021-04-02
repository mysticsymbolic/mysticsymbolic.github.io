import React from "react";
import ReactDOM from "react-dom";
import { PageContext, PAGE_QUERY_ARG } from "./page";
import { pageNames, Pages, toPageName, DEFAULT_PAGE } from "./pages";

const APP_ID = "app";

const appEl = document.getElementById(APP_ID);

if (!appEl) {
  throw new Error(`Unable to find #${APP_ID}!`);
}

const App: React.FC<{}> = (props) => {
  const page = new URLSearchParams(window.location.search);
  const currPage = toPageName(page.get(PAGE_QUERY_ARG) || "", DEFAULT_PAGE);
  const PageComponent = Pages[currPage];
  const ctx: PageContext = {
    currPage,
    allPages: pageNames,
  };

  return (
    <PageContext.Provider value={ctx}>
      <PageComponent />
    </PageContext.Provider>
  );
};

ReactDOM.render(<App />, appEl);
