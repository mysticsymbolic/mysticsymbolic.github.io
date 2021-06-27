import React from "react";
import { Page } from "../page";
import { Debug } from "../debug";

export const DebugPage: React.FC<{}> = () => (
  <Page title="Debug!">
    <Debug />
  </Page>
);
