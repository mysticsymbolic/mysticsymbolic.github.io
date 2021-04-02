import React, { useContext } from "react";
import type { PageName } from "./pages";

export type PageContext = {
  currPage: PageName;
  allPages: PageName[];
};

export const PageContext = React.createContext<PageContext>({
  currPage: "vocabulary",
  allPages: [],
});

export const PAGE_QUERY_ARG = "p";

const PageLink: React.FC<{ page: PageName }> = ({ page }) => (
  <a href={`?${PAGE_QUERY_ARG}=${encodeURIComponent(page)}`}>{page}</a>
);

const Navbar: React.FC<{}> = (props) => {
  const pc = useContext(PageContext);

  return (
    <ul className="navbar">
      {pc.allPages.map((pageName) => (
        <li key={pageName}>
          {pc.currPage === pageName ? pageName : <PageLink page={pageName} />}
        </li>
      ))}
    </ul>
  );
};

export type PageProps = {
  title: string;
  children?: any;
};

export const Page: React.FC<PageProps> = ({ title, children }) => {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>
        <h1>{title}</h1>
        {children}
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
