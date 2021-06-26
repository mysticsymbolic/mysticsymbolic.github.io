import React from "react";
import { Page } from "../page";
import { VocabularyRender } from "../vocabulary-render";

export const VocabularyPage: React.FC<{}> = () => (
  <Page title="Vocabulary!">
    <VocabularyRender />
  </Page>
);
