import {
  EMPTY_SVG_SYMBOL_DATA,
  getSvgSymbolFrequencyMultipler,
  SvgSymbolData,
} from "./svg-symbol";
import { Vocabulary } from "./vocabulary";
import _SvgVocabulary from "./_svg-vocabulary";

export const SvgVocabulary = new Vocabulary<SvgSymbolData>(
  _SvgVocabulary,
  getSvgSymbolFrequencyMultipler
);

export const SvgVocabularyWithBlank = new Vocabulary<SvgSymbolData>(
  [EMPTY_SVG_SYMBOL_DATA, ..._SvgVocabulary],
  getSvgSymbolFrequencyMultipler
);
