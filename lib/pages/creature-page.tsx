import React from "react";
import { Page } from "../page";
import { Creature } from "../creature";

export const CreaturePage: React.FC<{}> = () => (
  <Page title="Creature!">
    <Creature />
  </Page>
);
