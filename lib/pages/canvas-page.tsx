/* IMPORTS */
import React from "react";
import { Page } from "../page";
import { Clouds } from "../clouds";
import { Waves } from "../waves";
import { Creature } from "../creature";

export const CanvasPage: React.FC<{}> = () => {
  return (
    <Page title="Canvas">
      <Clouds />
      <Waves />
      <Creature />
    </Page>
  );
};
