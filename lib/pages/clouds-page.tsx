/* IMPORTS */
import React from "react";
import { Page } from "../page";
import { Clouds } from "../clouds";
import "./clouds.css";

export const CloudsPage: React.FC<{}> = () => {
  return (
    <Page title="Clouds">
      <Clouds />
    </Page>
  );
};
