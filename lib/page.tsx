import React, { MouseEvent, useContext } from "react";
import { Helmet } from "react-helmet";
import type { PageName } from "./pages";

export type PageContext = {
  currPage: PageName;
  allPages: PageName[];
  pushState: (href: string) => void;
  search: URLSearchParams;
};

export const PageContext = React.createContext<PageContext>({
  currPage: "vocabulary",
  allPages: [],
  search: new URLSearchParams(),
  pushState: () => {
    throw new Error("No page context is defined!");
  },
});

export const PAGE_QUERY_ARG = "p";

function isNormalLinkClick(e: MouseEvent): boolean {
  return !e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey && e.button === 0;
}

const PageLink: React.FC<{ page: PageName }> = ({ page }) => {
  const href = `?${PAGE_QUERY_ARG}=${encodeURIComponent(page)}`;
  const { pushState } = useContext(PageContext);
  const handleClick = (e: MouseEvent) => {
    if (isNormalLinkClick(e)) {
      pushState(href);
      e.preventDefault();
    }
  };

  return (
    <a href={href} onClick={handleClick}>
      {page}
    </a>
  );
};

const Navbar: React.FC<{}> = (props) => {
  const pc = useContext(PageContext);

  return (
    <nav>
      <ul className="navbar">
        {pc.allPages.map((pageName) => (
          <li key={pageName}>
            {pc.currPage === pageName ? pageName : <PageLink page={pageName} />}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export type PageProps = {
  title: string;
  children?: any;
};

export const Page: React.FC<PageProps> = ({ title, children }) => {
  const fullTitle = ` Mystic Symbolic ${title}`;

  return (
    <div className="page">
      <Helmet>
        <title>{fullTitle}</title>
      </Helmet>
      <header>
        <h1>{fullTitle}</h1>
        <Navbar />
      </header>
      {children}
      <footer>
        <p>
          For more details about this project, see its{" "}
          <a href="https://github.com/toolness/mystic-symbolic" target="_blank">
            GitHub repository
          </a>
          .
        </p>
      </footer>
    </div>
  );
};
