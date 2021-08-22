import React from "react";

export type GalleryComposition = {
  /** A unique identifier/primary key for the composition. */
  id: string;

  /** The type of composition. */
  kind: "creature" | "mandala";

  /**
   * The serialized value of the composition. This
   * is interpreted differently based on the composition
   * type.
   */
  serializedValue: string;

  /** The user ID of the user who submitted the composition. */
  owner: string;

  /**
   * The name of the user who submitted the composition.
   */
  ownerName: string;

  /** The title of the composition. */
  title: string;

  /** When the composition was submitted to the gallery. */
  createdAt: Date;
};

/**
 * A generic interface for interacting with the gallery.
 */
export interface GalleryContext {
  /**
   * All the compositions in the gallery that have been loaded
   * from the network.
   */
  compositions: GalleryComposition[];

  /** Whether we're currently loading the gallery from the network. */
  isLoading: boolean;

  /** If a network error occurred, this is it. */
  error?: string;

  /**
   * Attempt to refresh the gallery from the network. Return whether
   * the request was accepted (if we're already loading the gallery, or
   * if a prequisite service hasn't been initialized yet, this can
   * return `false`).
   */
  refresh(): boolean;

  /**
   * The timestamp (milliseconds since 1970) of the last time
   * the gallery data was refreshed. If it has never been loaded,
   * this will be 0.
   */
  lastRefresh: number;
}

export const GalleryContext = React.createContext<GalleryContext>({
  compositions: [],
  isLoading: false,
  refresh: () => true,
  lastRefresh: 0,
});
