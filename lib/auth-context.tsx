import React from "react";

/**
 * Generic interface for authentication.
 */
export interface AuthContext {
  /**
   * The currently logged-in user. This will be
   * null if the user isn't logged in.
   */
  loggedInUser: { name: string; id: string } | null;

  /**
   * The name of the authentication provider, e.g. "GitHub",
   * or null if auth is disabled.
   */
  providerName: string | null;

  /**
   * If authentication failed for some reason, this will
   * be a string describing the error.
   */
  error?: string;

  /** Begin the login UI flow. */
  login(): void;

  /** Log out the user. */
  logout(): void;
}

export const AuthContext = React.createContext<AuthContext>({
  loggedInUser: null,
  providerName: null,
  login() {},
  logout() {},
});
