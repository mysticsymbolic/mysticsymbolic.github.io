import React from "react";

export type GalleryComposition = {
  id: string;
  kind: "creature" | "mandala";
  owner: string;
  ownerName: string;
  title: string;
  serializedValue: string;
};

export interface GalleryContext {
  compositions: GalleryComposition[];
  isLoading: boolean;
  error?: string;
  refresh(): boolean;
  lastRefresh: number;
}

export const GalleryContext = React.createContext<GalleryContext>({
  compositions: [],
  isLoading: false,
  refresh: () => true,
  lastRefresh: 0,
});
