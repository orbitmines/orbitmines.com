/**
 * Site-wide feature toggles. Flip one to `true` to bring the feature back;
 * nothing behind a toggle is deleted, only unmounted.
 */
export const FEATURES = {
  /**
   * The Ether: Ether's Almanac (the /almanac route and its card on the home
   * page), the `@me` button at the top of every page together with the
   * username selection behind it, and the "Download Ether" button.
   */
  ETHER: false,
};
