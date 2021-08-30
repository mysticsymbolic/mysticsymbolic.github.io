import React, { useContext, useEffect, useRef } from "react";
import { AutoSizingSvg } from "../auto-sizing-svg";
import {
  CreatureContext,
  CreatureContextType,
  CreatureSymbol,
} from "../creature-symbol";
import { GalleryComposition, GalleryContext } from "../gallery-context";
import { Page } from "../page";
import { createPageWithStateSearchParams } from "../page-with-shareable-state";
import { svgScale, SvgTransform } from "../svg-transform";
import { CreatureDesign } from "./creature-page/core";
import { deserializeCreatureDesign } from "./creature-page/serialization";

import "./gallery-page.css";

function compositionRemixUrl(comp: GalleryComposition): string {
  return (
    "?" +
    createPageWithStateSearchParams(comp.kind, comp.serializedValue).toString()
  );
}

const THUMBNAIL_CLASS = "gallery-thumbnail canvas";

const EmptyThumbnail: React.FC = () => (
  <div className={THUMBNAIL_CLASS + " is-empty"}></div>
);

const CreatureThumbnail: React.FC<{ design: CreatureDesign }> = (props) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const ctx: CreatureContextType = {
    ...useContext(CreatureContext),
    ...props.design.compCtx,
  };
  const { background } = props.design.compCtx;

  return (
    <div className={THUMBNAIL_CLASS} style={{ backgroundColor: background }}>
      <CreatureContext.Provider value={ctx}>
        <AutoSizingSvg padding={10} ref={svgRef} bgColor={background}>
          <SvgTransform transform={svgScale(0.2)}>
            <CreatureSymbol {...props.design.creature} />
          </SvgTransform>
        </AutoSizingSvg>
      </CreatureContext.Provider>
    </div>
  );
};

function getThumbnail(gc: GalleryComposition): JSX.Element {
  if (gc.kind === "creature") {
    let design: CreatureDesign;
    try {
      design = deserializeCreatureDesign(gc.serializedValue);
    } catch (e) {
      console.log(`Could not deserialize creature "${gc.title}"`, e);
      return <EmptyThumbnail />;
    }
    return <CreatureThumbnail design={design} />;
  }
  return <EmptyThumbnail />;
}

const GalleryCompositionView: React.FC<GalleryComposition> = (props) => {
  const thumbnail = getThumbnail(props);
  const url = compositionRemixUrl(props);

  return (
    <div className="gallery-item">
      <a href={url} target="_blank">
        {thumbnail}
      </a>
      <p>
        <a href={url} target="_blank">
          {props.title}
        </a>{" "}
        {props.kind} by {props.ownerName}
      </p>
    </div>
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
          You can publish to this gallery via the sidebar on other pages of this
          site.
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
