import type { SvgSymbolData } from "./svg-symbol";
import { Vocabulary } from "./vocabulary";
import _SvgVocabulary from "./_svg-vocabulary.json";

export const SvgVocabulary = new Vocabulary<SvgSymbolData>(
  _SvgVocabulary as any
);
