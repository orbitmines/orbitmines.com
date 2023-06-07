import IModule, {useModule} from "./IModule";
import {HotkeyConfig} from "@blueprintjs/core/src/hooks/hotkeys/hotkeyConfig";
import {useHotkeys as useBlueprintJSHotkeys} from '@blueprintjs/core';
import {useState} from "react";

export const HOTKEYS_MODULE = 'hotkeys';

export type IHotkeysModule = IModule<HTMLElement, 'onKeyDown' | 'onKeyUp'> & {
  reset: () => void,
  add: (...hotkeys: HotkeyConfig[]) => void,
  set: (...hotkeys: HotkeyConfig[]) => void,
  all: () => HotkeyConfig[],
}

export const useHotkeys = (): IHotkeysModule => useModule(HOTKEYS_MODULE) as IHotkeysModule;

export const useHotkeysModule = (...initialHotkeys: HotkeyConfig[]): IHotkeysModule => {
  const [hotkeys, setHotkeys] = useState<HotkeyConfig[]>(initialHotkeys ?? []);

  // Hotkeys: https://blueprintjs.com/docs/#core/hooks/use-hotkeys
  const { handleKeyDown: onKeyDown, handleKeyUp: onKeyUp } = useBlueprintJSHotkeys(hotkeys, {
    showDialogKeyCombo: "?",
  });

  const module: IHotkeysModule = {
    identifier: HOTKEYS_MODULE,

    reset: () => setHotkeys(initialHotkeys),
    add: (...added: HotkeyConfig[]) => setHotkeys([...hotkeys, ...added]),
    set: (...hotkeys: HotkeyConfig[]) => setHotkeys([...hotkeys]),
    all: () => hotkeys,

    onKeyDown,
    onKeyUp
  }

  return module;
}

export default useHotkeysModule;