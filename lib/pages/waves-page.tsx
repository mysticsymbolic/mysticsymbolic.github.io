/* IMPORTS */
import React from "react";
import { Helmet } from "react-helmet";
import { Page } from "../page";
import { Waves } from "../waves";

export const WavesPage: React.FC<{}> = () => {
  return (
    <Page title="Waves">
      <Helmet>
        <link rel="stylesheet" href="css/waves.css" />
      </Helmet>
      <Waves />
    </Page>
  );
};
