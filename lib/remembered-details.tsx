import React from "react";
import { useRememberedState } from "./use-remembered-state";

/**
 * A `<details>` element that remembers whether it was opened or closed via
 * the given global id, so that if the component is unmounted and remounted,
 * it can be shown in the same state it was previously in.
 */
export const RememberedDetails: React.FC<{ id: string }> = ({
  id,
  children,
}) => {
  const [isOpen, setIsOpen] = useRememberedState(id, false);

  return (
    <details
      onToggle={(e) => setIsOpen((e.currentTarget as HTMLDetailsElement).open)}
      open={isOpen}
    >
      {children}
    </details>
  );
};
