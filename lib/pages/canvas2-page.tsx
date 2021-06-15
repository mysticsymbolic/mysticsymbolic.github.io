/* IMPORTS */
import React from "react";
import { Helmet } from "react-helmet";
import { Page } from "../page";
import { Clouds } from "../clouds";
import { Landscape } from "../landscape";
import { Creature } from "../creature";

export const Canvas2Page: React.FC<{}> = () => {
  return (
    <Page title="Canvas 2">
      <Helmet>
        <link rel="stylesheet" href="css/canvas2.css" />
      </Helmet>
      <Clouds />
      <Landscape />
      <Creature />
    </Page>
  );
};
