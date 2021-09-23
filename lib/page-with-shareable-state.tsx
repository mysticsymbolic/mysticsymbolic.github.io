import React, { useCallback, useContext, useEffect, useState } from "react";
import { PageContext, PAGE_QUERY_ARG } from "./page";
import type { PageName } from "./pages";

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
   * Deserialize the given state, throwing an exception
   * if it's invalid in any way.
   */
  deserialize: (value: string) => T;

  /** Serialize the given state to a string. */
  serialize: (value: T) => string;

  /** Component to render the page. */
  component: React.ComponentType<ComponentWithShareableStateProps<T>>;
};

/** The query string argument that will store the serialized state. */
export const STATE_QUERY_ARG = "s";

export function createPageWithStateSearchParams(
  page: PageName,
  state: string
): URLSearchParams {
  const search = new URLSearchParams();
  search.set(PAGE_QUERY_ARG, page);
  search.set(STATE_QUERY_ARG, state);
  return search;
}

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

    /** The default state from the URL, which we'll pass into our component. */
    let defaults: T = defaultValue;
    let didDeserializeThrow = false;

    try {
      defaults = deserialize(state || "");
    } catch (e) {
      console.log(`Error deserializing state: ${e}`);
      didDeserializeThrow = true;
    }

    const [showError, setShowError] = useState(didDeserializeThrow);

    const onChange = useCallback(
      (value: T) => {
        const newState = serialize(value);
        if (state !== newState) {
          const newSearch = createPageWithStateSearchParams(currPage, newState);
          setIsInOnChange(true);
          setLatestState(newState);
          pushState("?" + newSearch.toString());
          setIsInOnChange(false);
        }
      },
      [state, currPage, pushState]
    );

    useEffect(() => {
      if (!isInOnChange && latestState !== state) {
        // The user navigated in their browser.
        setLatestState(state);
        setKey(key + 1);
      }
    }, [isInOnChange, state, latestState, key]);

    return (
      <>
        {showError && (
          <div className="page-error">
            <div>
              <p>
                Sorry, an error occurred when trying to load the composition on
                this page.
              </p>
              <p>
                Either its data is corrupted, or displaying it is no longer
                supported.
              </p>
              <button onClick={() => setShowError(false)}>OK</button>
            </div>
          </div>
        )}
        <Component key={key} defaults={defaults} onChange={onChange} />
      </>
    );
  };

  return PageWithShareableState;
}
