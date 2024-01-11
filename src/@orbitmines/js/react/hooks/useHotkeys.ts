import IModule, {useModule} from "../IModule";
import {HotkeyConfig} from "@blueprintjs/core/src/hooks/hotkeys/hotkeyConfig";
import {useHotkeys as useBlueprintJSHotkeys} from '@blueprintjs/core';
import {useState} from "react";
import _ from "lodash";

export type HotkeyConfigMod = HotkeyConfig & { combo: string | string[] }

export const HOTKEYS_MODULE = 'hotkeys';

export type IHotkeysModule = IModule<HTMLElement, 'onKeyDown' | 'onKeyUp'> & {
  reset: () => void,
  add: (...hotkeys: HotkeyConfigMod[]) => void,
  set: (...hotkeys: HotkeyConfigMod[]) => void,
  all: () => HotkeyConfigMod[],
}

export const useHotkeys = (): IHotkeysModule => useModule(HOTKEYS_MODULE) as IHotkeysModule;

export const useHotkeysModule = (...initialHotkeys: HotkeyConfigMod[]): IHotkeysModule => {
  const [hotkeys, setHotkeys] = useState<HotkeyConfig[]>(initialHotkeys ?? []);

  // Hotkeys: https://blueprintjs.com/docs/#core/hooks/use-hotkeys
  const { handleKeyDown: onKeyDown, handleKeyUp: onKeyUp } = useBlueprintJSHotkeys(hotkeys, {
    showDialogKeyCombo: "?",
  });

  const setHotKeysMod = (hotkeys: HotkeyConfigMod[]): void => setHotkeys(
    hotkeys.flatMap(hotkey =>
      !_.isArray(hotkey.combo) ? hotkey : hotkey.combo.map(
        combo => <HotkeyConfig>{...hotkey, combo}
      )
    )
  )


  const module: IHotkeysModule = {
    identifier: HOTKEYS_MODULE,

    reset: () => setHotKeysMod(initialHotkeys),
    add: (...added: HotkeyConfigMod[]) => setHotKeysMod([...hotkeys, ...added]),
    set: (...hotkeys: HotkeyConfigMod[]) => setHotKeysMod([...hotkeys]),
    all: () => hotkeys,

    onKeyDown,
    onKeyUp
  }

  return module;
}

export default useHotkeysModule;