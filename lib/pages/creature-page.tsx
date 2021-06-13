/* IMPORTS */
import React from "react";
import { Helmet } from "react-helmet";
import { Page } from "../page";
import { Creature } from "../creature";

export const CreaturePage: React.FC<{}> = () => {
  return (
    <Page title="Creature">
      <Helmet>
        <link rel="stylesheet" href="css/creature.css" />
      </Helmet>
      <Creature />
    </Page>
  );
};
