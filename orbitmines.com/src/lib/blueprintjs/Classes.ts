const NS = 'bp5';

export const Classes = {
  NS,
  BUTTON: `${NS}-button`,
  ICON: `${NS}-icon`,
  ICON_STANDARD: `${NS}-icon-standard`,
  ICON_LARGE: `${NS}-icon-large`,
  TAG: `${NS}-tag`,
  TAG_MINIMAL: `${NS}-minimal`,
  DIVIDER: `${NS}-divider`,
  HEADING: `${NS}-heading`,
  INPUT: `${NS}-input`,
  INPUT_GROUP: `${NS}-input-group`,
  INTENT_PRIMARY: `${NS}-intent-primary`,
  INTENT_SUCCESS: `${NS}-intent-success`,
  INTENT_WARNING: `${NS}-intent-warning`,
  INTENT_DANGER: `${NS}-intent-danger`,
  TEXT_MUTED: `${NS}-text-muted`,
  TEXT_DISABLED: `${NS}-text-disabled`,
  POPOVER: `${NS}-popover`,
  POPOVER_TARGET: `${NS}-popover-target`,
  POPOVER_CONTENT: `${NS}-popover-content`,
  DARK: `${NS}-dark`,
  MINIMAL: `${NS}-minimal`,
  MULTILINE: `${NS}-multiline`,
  FILL: `${NS}-fill`,
  iconClass(iconName?: string) {
    return iconName == null ? undefined : `${NS}-icon-${iconName}`;
  },
  intentClass(intent?: string) {
    if (intent == null || intent === 'none') return undefined;
    return `${NS}-intent-${intent}`;
  },
} as const;

export default Classes;
