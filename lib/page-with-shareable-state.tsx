import React, { useContext, useEffect, useMemo, useState } from "react";
import { PageContext, PAGE_QUERY_ARG } from "./page";

export type ComponentWithShareableStateProps<T> = {
  /** The default state to use when the component is first rendered. */
  defaults: T;

  /**
   * Callback to trigger whenever the shareable state changes. Note
   * that each call will add a new entry to the browser's navigation history.
   * As such, every call to this function will mark a boundary where the
   * user can press the "back" button to go back to the previous state.
   */
  onChange: (value: T) => void;
};

export type PageWithShareableStateOptions<T> = {
  /** The default shareable state. */
  defaultValue: T;

  /**
   * Deserialize the given state, falling back to the
   * given default value for anything that's invalid.
   */
  deserialize: (value: string, defaultValue: T) => T;

  /** Serialize the given state to a string. */
  serialize: (value: T) => string;

  /** Component to render the page. */
  component: React.ComponentType<ComponentWithShareableStateProps<T>>;
};

/** The query string argument that will store the serialized state. */
export const STATE_QUERY_ARG = "s";

/**
 * Create a component that represents a page which exposes some
 * aspect of its state in the current URL, so that it can be
 * easily shared, recorded in the browser history, etc.
 */
export function createPageWithShareableState<T>({
  defaultValue,
  deserialize,
  serialize,
  component,
}: PageWithShareableStateOptions<T>): React.FC<{}> {
  const Component = component;

  const PageWithShareableState: React.FC<{}> = () => {
    const { search, pushState, currPage } = useContext(PageContext);

    /** The current serialized state, as reflected in the URL bar. */
    const state = search.get(STATE_QUERY_ARG) || serialize(defaultValue);

    /**
     * What we think the latest serialized state is; used to determine whether
     * the user navigated in their browser history.
     */
    const [latestState, setLatestState] = useState(state);

    /**
     * The key to use when rendering our page component. This will
     * be incremented whenever the user navigates their browser
     * history, to ensure that our component resets itself to the
     * default state we pass in.
     */
    const [key, setKey] = useState(0);

    /**
     * Remembers whether we're in the middle of an update triggered by
     * our own component.
     */
    const [isInOnChange, setIsInOnChange] = useState(false);

    /** The default state from th URL, which we'll pass into our component. */
    const defaults: T = deserialize(state || "", defaultValue);

    const onChange = useMemo(
      () => (value: T) => {
        const newState = serialize(value);
        if (state !== newState) {
          const newSearch = new URLSearchParams();
          newSearch.set(PAGE_QUERY_ARG, currPage);
          newSearch.set(STATE_QUERY_ARG, newState);
          setIsInOnChange(true);
          setLatestState(newState);
          pushState("?" + newSearch.toString());
          setIsInOnChange(false);
        }
      },
      [state, currPage]
    );

    useEffect(() => {
      if (!isInOnChange && latestState !== state) {
        // The user navigated in their browser.
        setLatestState(state);
        setKey(key + 1);
      }
    });

    return <Component key={key} defaults={defaults} onChange={onChange} />;
  };

  return PageWithShareableState;
}
