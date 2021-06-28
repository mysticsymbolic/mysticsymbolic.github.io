import { WavesPage } from "./waves-page";
import { VocabularyPage } from "./vocabulary-page";
import { CreaturePage } from "./creature-page";
import { MandalaPage } from "./mandala-page";
import { DebugPage } from "./debug-page";

export const Pages = {
  vocabulary: VocabularyPage,
  creature: CreaturePage,
  waves: WavesPage,
  mandala: MandalaPage,
  debug: DebugPage,
};

export type PageName = keyof typeof Pages;

export const pageNames = Object.keys(Pages) as PageName[];

export const DEFAULT_PAGE: PageName = "creature";

export function isPageName(page: string): page is PageName {
  return pageNames.includes(page as any);
}

export function toPageName(page: string, defaultValue: PageName): PageName {
  if (isPageName(page)) return page;
  return defaultValue;
}
