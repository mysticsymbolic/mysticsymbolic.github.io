/* IMPORTS */
import React from "react";
import { Helmet } from "react-helmet";
import { Page } from "../page";
import { Clouds } from "../clouds";
import { Waves } from "../waves";
import { Creature } from "../creature";

export const CanvasPage: React.FC<{}> = () => {
  return (
    <Page title="Canvas">
      <Helmet>
        <link rel="stylesheet" href="css/canvas.css" />
      </Helmet>
      <Clouds />
      <Waves />
      <Creature />
    </Page>
  );
};
