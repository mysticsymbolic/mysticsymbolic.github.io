import React from "react";
import ReactDOM from "react-dom";
import { pageNames, Pages, toPageName, DEFAULT_PAGE } from "./pages";

const APP_ID = "app";

const appEl = document.getElementById(APP_ID);

if (!appEl) {
  throw new Error(`Unable to find #${APP_ID}!`);
}

const Navbar: React.FC<{ currPageName: string }> = (props) => (
  <ul className="navbar">
    {pageNames.map((pageName) => (
      <li key={pageName}>
        {props.currPageName === pageName ? (
          pageName
        ) : (
          <a href={`?p=${encodeURIComponent(pageName)}`}>{pageName}</a>
        )}
      </li>
    ))}
  </ul>
);

const App: React.FC<{}> = (props) => {
  const page = new URLSearchParams(window.location.search);
  const currPageName = toPageName(page.get("p") || "", DEFAULT_PAGE);
  const PageComponent = Pages[currPageName];

  return (
    <>
      <header>
        <Navbar currPageName={currPageName} />
      </header>
      <main>
        <PageComponent />
      </main>
      <footer>
        <p>
          For more details about this project, see its{" "}
          <a href="https://github.com/toolness/mystic-symbolic" target="_blank">
            GitHub repository
          </a>
          .
        </p>
      </footer>
    </>
  );
};

ReactDOM.render(<App />, appEl);
