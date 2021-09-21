import type { PageName } from ".";

/**
 * Return the human-friendly page name of the given page, which we'd
 * like to show to end-users.
 */
export function getFriendlyPageName(pageName: PageName): string {
  if (pageName === "creature") return "cluster";
  return pageName;
}
