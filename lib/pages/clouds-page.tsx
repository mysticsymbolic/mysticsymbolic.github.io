/* IMPORTS */
import React from "react";
import { Helmet } from "react-helmet";
import { Page } from "../page";
import { Clouds } from "../clouds";

export const CloudsPage: React.FC<{}> = () => {
  return (
    <Page title="Clouds">
      <Helmet>
        <link rel="stylesheet" href="css/clouds.css" />
      </Helmet>
      <Clouds />
    </Page>
  );
};
