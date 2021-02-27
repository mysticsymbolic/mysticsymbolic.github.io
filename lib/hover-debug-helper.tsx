import React, { useState } from "react";

export const HoverDebugHelper: React.FC<{
  children: any;
}> = (props) => {
  type HoverInfo = {
    x: number;
    y: number;
    text: string;
  };
  let [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const handleMouseMove: React.MouseEventHandler = (e) => {
    const { target } = e;
    if (target instanceof SVGElement) {
      const x = e.clientX;
      const y = e.clientY;
      const path: string[] = [];
      let node = target;
      while (true) {
        const {
          specType,
          specIndex,
          symbolName,
          attachParent,
          attachType,
          attachIndex,
        } = node.dataset;
        if (specType && specIndex) {
          path.unshift(`${specType}[${specIndex}]`);
        } else if (symbolName) {
          path.unshift(symbolName);
        } else if (attachParent && attachType && attachIndex && path.length) {
          const i = path.length - 1;
          path[i] = `${path[i]}@${attachParent}.${attachType}[${attachIndex}]`;
        }
        if (node.parentNode instanceof SVGElement) {
          node = node.parentNode;
        } else {
          break;
        }
      }
      if (path.length) {
        setHoverInfo({ x, y, text: path.join(".") });
        return;
      }
    }
    setHoverInfo(null);
  };

  return (
    <div onMouseMove={handleMouseMove}>
      {hoverInfo && (
        <div
          className="hover-debug-helper"
          style={{
            position: "absolute",
            pointerEvents: "none",
            top: `${hoverInfo.y}px`,
            left: `${hoverInfo.x}px`,
          }}
        >
          {hoverInfo.text}
        </div>
      )}
      {props.children}
    </div>
  );
};
