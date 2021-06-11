/* IMPORTS */
import React from "react";
import { Page } from "../page";
import { Creature } from "../creature";
import "./clouds.css";

export const CreaturePage: React.FC<{}> = () => {
  return (
    <Page title="Creature">
      <Creature />
    </Page>
  );
};
