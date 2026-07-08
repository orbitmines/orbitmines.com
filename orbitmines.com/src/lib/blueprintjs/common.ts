export type IntentValue = 'none' | 'primary' | 'success' | 'warning' | 'danger';

export const Intent = {
  NONE: 'none',
  PRIMARY: 'primary',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
} as const;
export type Intent = (typeof Intent)[keyof typeof Intent];

export const IconSize = {
  STANDARD: 16,
  LARGE: 20,
} as const;
export type IconSize = (typeof IconSize)[keyof typeof IconSize];

export interface IntentProps {
  intent?: IntentValue;
}

export interface Props {
  className?: string;
  style?: React.CSSProperties;
}
