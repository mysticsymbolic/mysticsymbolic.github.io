import React from "react";
import {
  AttachedCreatureSymbol,
  CreatureSymbol,
  NestedCreatureSymbol,
} from "./creature-symbol";
import { AttachmentPointType } from "./specs";
import { SvgSymbolData } from "./svg-symbol";

type AttachmentIndices = {
  left?: boolean;
  right?: boolean;
};

type AttachmentChildren = JSX.Element | JSX.Element[];

type SimpleCreatureSymbolProps = AttachmentIndices & {
  nestInside?: boolean;
  children?: AttachmentChildren;
  attachTo?: AttachmentPointType;
  invert?: boolean;
  indices?: number[];
};

function getAttachmentIndices(ai: AttachmentIndices): number[] {
  const result: number[] = [];

  if (ai.left) {
    result.push(0);
  }
  if (ai.right) {
    result.push(1);
  }
  if (result.length === 0) {
    result.push(0);
  }
  return result;
}

type SplitCreatureSymbolChildren = {
  attachments: JSX.Element[];
  nests: JSX.Element[];
};

function splitCreatureSymbolChildren(
  children?: AttachmentChildren
): SplitCreatureSymbolChildren {
  const result: SplitCreatureSymbolChildren = {
    attachments: [],
    nests: [],
  };
  if (!children) return result;

  React.Children.forEach(children, (child) => {
    if (child.props.nestInside) {
      result.nests.push(child);
    } else {
      result.attachments.push(child);
    }
  });

  return result;
}

type SimpleCreatureSymbolFC = React.FC<SimpleCreatureSymbolProps> & {
  creatureSymbolData: SvgSymbolData;
};

/**
 * Create a factory that can be used to return React components to
 * render a `<CreatureSymbol>`.
 */
export function createCreatureSymbolFactory(
  getSymbol: (name: string) => SvgSymbolData
) {
  /**
   * Returns a React component that renders a `<CreatureSymbol>`, using the symbol
   * with the given name as its default data.
   */
  return function createCreatureSymbol(
    name: string
  ): React.FC<SimpleCreatureSymbolProps> {
    const data = getSymbol(name);
    const Component: SimpleCreatureSymbolFC = (props) => {
      const symbol = getCreatureSymbol(data, props);
      return <CreatureSymbol {...symbol} />;
    };
    Component.creatureSymbolData = data;
    return Component;
  };
}

function isSimpleCreatureSymbolFC(fn: any): fn is SimpleCreatureSymbolFC {
  return !!fn.creatureSymbolData;
}

function extractNestedCreatureSymbol(el: JSX.Element): NestedCreatureSymbol {
  const base = extractCreatureSymbolFromElement(el);
  const props: SimpleCreatureSymbolProps = el.props;
  const indices = props.indices || getAttachmentIndices(props);
  const result: NestedCreatureSymbol = {
    ...base,
    indices,
  };
  return result;
}

function extractAttachedCreatureSymbol(
  el: JSX.Element
): AttachedCreatureSymbol {
  const base = extractNestedCreatureSymbol(el);
  const props: SimpleCreatureSymbolProps = el.props;
  const { attachTo } = props;
  if (!attachTo) {
    throw new Error("Expected attachment to have `attachTo` prop!");
  }
  const result: AttachedCreatureSymbol = {
    ...base,
    attachTo,
  };
  return result;
}

function getCreatureSymbol(
  data: SvgSymbolData,
  props: SimpleCreatureSymbolProps
): CreatureSymbol {
  const { attachments, nests } = splitCreatureSymbolChildren(props.children);
  const result: CreatureSymbol = {
    data,
    attachments: attachments.map(extractAttachedCreatureSymbol),
    nests: nests.map(extractNestedCreatureSymbol),
    invertColors: props.invert ?? false,
  };
  return result;
}

function extractCreatureSymbolFromElement(el: JSX.Element): CreatureSymbol {
  if (isSimpleCreatureSymbolFC(el.type)) {
    return getCreatureSymbol(el.type.creatureSymbolData, el.props);
  }
  throw new Error("Found unknown component type!");
}
