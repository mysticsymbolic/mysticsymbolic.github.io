import React from "react";
import { Page } from "../page";
import { Mandala } from "./mandala";

export const MandalaPage: React.FC<{}> = () => (
  <Page title="Mandala!">
    <Mandala />
  </Page>
);
