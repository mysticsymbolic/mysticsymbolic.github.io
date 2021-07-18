import { createPageWithShareableState } from "../../page-with-shareable-state";
import { CreaturePageWithDefaults, CREATURE_DESIGN_DEFAULTS } from "./core";
import {
  deserializeCreatureDesign,
  serializeCreatureDesign,
} from "./serialization";

export const CreaturePage = createPageWithShareableState({
  defaultValue: CREATURE_DESIGN_DEFAULTS,
  serialize: serializeCreatureDesign,
  deserialize: deserializeCreatureDesign,
  component: CreaturePageWithDefaults,
});
