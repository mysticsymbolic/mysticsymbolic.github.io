/* IMPORTS */
import React from "react";
import { Helmet } from "react-helmet";
import { Page } from "../page";
import { Landscape } from "../landscape";

export const LandscapePage: React.FC<{}> = () => {
  return (
    <Page title="Landscape">
      <Helmet>
        <link rel="stylesheet" href="css/landscape.css" />
      </Helmet>
      <Landscape />
    </Page>
  );
};
