import type { SvgSymbolData } from "./svg-symbol";
import _SvgVocabulary from "./_svg-vocabulary.json";

export const SvgVocabulary: SvgSymbolData[] = _SvgVocabulary as any;

/**
 * Mapping from symbol names to symbol data, for quick and easy access.
 */
const SYMBOL_MAP = new Map(
  SvgVocabulary.map((symbol) => [symbol.name, symbol])
);

/**
 * Returns the data for the given symbol, throwing an error
 * if it doesn't exist.
 */
export function getSvgSymbol(name: string): SvgSymbolData {
  const symbol = SYMBOL_MAP.get(name);
  if (!symbol) {
    throw new Error(`Unable to find the symbol "${name}"!`);
  }
  return symbol;
}
