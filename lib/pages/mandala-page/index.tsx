import { createPageWithShareableState } from "../../page-with-shareable-state";
import { MANDALA_DESIGN_DEFAULTS, MandalaPageWithDefaults } from "./core";
import {
  deserializeMandalaDesign,
  serializeMandalaDesign,
} from "./serialization";

export const MandalaPage = createPageWithShareableState({
  defaultValue: MANDALA_DESIGN_DEFAULTS,
  serialize: serializeMandalaDesign,
  deserialize: deserializeMandalaDesign,
  component: MandalaPageWithDefaults,
});
