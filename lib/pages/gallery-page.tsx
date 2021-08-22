import React, { useContext, useEffect } from "react";
import { GalleryComposition, GalleryContext } from "../gallery-context";
import { Page } from "../page";
import { createPageWithStateSearchParams } from "../page-with-shareable-state";

function compositionRemixUrl(comp: GalleryComposition): string {
  return (
    "?" +
    createPageWithStateSearchParams(comp.kind, comp.serializedValue).toString()
  );
}

const GalleryCompositionView: React.FC<GalleryComposition> = (props) => {
  return (
    <p>
      <a href={compositionRemixUrl(props)} target="_blank">
        {props.title}
      </a>{" "}
      {props.kind} by {props.ownerName}
    </p>
  );
};

export const GalleryPage: React.FC<{}> = () => {
  const ctx = useContext(GalleryContext);

  useEffect(() => {
    if (ctx.lastRefresh === 0) {
      ctx.refresh();
    }
  }, [ctx]);

  return (
    <Page title="Gallery!">
      <div className="sidebar">
        <p>
          This gallery is a work in progress! You can publish to it via the
          sidebar on the creature and mandala pages. We don't have thumbnails
          yet, though. It will improve over time.
        </p>
        <button onClick={ctx.refresh} disabled={ctx.isLoading}>
          {ctx.isLoading ? "Loading\u2026" : "Refresh"}
        </button>
        {ctx.error && <p className="error">{ctx.error}</p>}
      </div>
      <div className="canvas scrollable">
        {ctx.compositions.map((comp) => (
          <GalleryCompositionView key={comp.id} {...comp} />
        ))}
      </div>
    </Page>
  );
};
