/**
 * Site-wide feature toggles. Flip one to `true` to bring the feature back;
 * nothing behind a toggle is deleted, only unmounted.
 */
export const FEATURES = {
  /**
   * The Ether: Ether's Almanac (the /almanac route and its card on the home
   * page), the `@me` button at the top of every page together with the
   * username selection behind it, the "Download Ether" button, and the
   * follow/download/chat/PR/settings buttons on user profile pages.
   */
  ETHER: false,
  /**
   * The Physics Project: the /physics route, its booklet card on the home
   * page, and its entry in the writings lists (home page and profile).
   */
  PHYSICS: false,
};
