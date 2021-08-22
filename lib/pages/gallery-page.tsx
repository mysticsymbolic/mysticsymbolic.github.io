import React, { useContext, useEffect, useState } from "react";
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
  const [refreshed, setRefreshed] = useState(false);

  useEffect(() => {
    if (!refreshed) {
      if (ctx.refresh()) {
        setRefreshed(true);
      }
    }
  }, [ctx, refreshed]);

  return (
    <Page title="Gallery!">
      <div className="sidebar">
        <button onClick={() => setRefreshed(false)} disabled={ctx.isLoading}>
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
