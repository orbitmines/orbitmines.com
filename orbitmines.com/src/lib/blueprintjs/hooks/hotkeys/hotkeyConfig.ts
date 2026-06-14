export interface HotkeyConfig {
  combo: string;
  label?: string;
  global?: boolean;
  group?: string;
  disabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  allowInInput?: boolean;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
}
