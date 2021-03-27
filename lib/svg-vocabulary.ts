import type { SvgSymbolData } from "./svg-symbol";
import { Vocabulary } from "./vocabulary";
import _SvgVocabulary from "./_svg-vocabulary.js";

export const SvgVocabulary = new Vocabulary<SvgSymbolData>(_SvgVocabulary);
