import { WavesPage } from "./waves-page";
import { CloudsPage } from "./clouds-page";
import { LandscapePage } from "./landscape-page";
import { CanvasPage } from "./canvas-page";
import { Canvas2Page } from "./canvas2-page";
import { VocabularyPage } from "./vocabulary-page";
import { CreaturePage } from "./creature-page";
import { MandalaPage } from "./mandala-page";
import { DebugPage } from "./debug-page";

export const Pages = {
  canvas: CanvasPage,
  canvas2: Canvas2Page,
  mandala: MandalaPage,
  creature: CreaturePage,
  clouds: CloudsPage,
  landscape: LandscapePage,
  waves: WavesPage,
  vocabulary: VocabularyPage,
  debug: DebugPage,
};

export type PageName = keyof typeof Pages;

export const pageNames = Object.keys(Pages) as PageName[];

export const DEFAULT_PAGE: PageName = "canvas";

export function isPageName(page: string): page is PageName {
  return pageNames.includes(page as any);
}

export function toPageName(page: string, defaultValue: PageName): PageName {
  if (isPageName(page)) return page;
  return defaultValue;
}
