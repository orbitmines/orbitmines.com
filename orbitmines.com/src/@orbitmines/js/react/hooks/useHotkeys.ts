import IModule, {useModule} from "../IModule";
import {HotkeyConfig} from "@blueprintjs/core/src/hooks/hotkeys/hotkeyConfig";
import {useHotkeys as useBlueprintJSHotkeys} from '@blueprintjs/core';
import {useState} from "react";
import _ from "lodash";

export type PressedKeys = string[];
export type HotkeyEventOptions = { pressed: PressedKeys };
export type HotkeyConfigMod = HotkeyConfig & {
  combo: string | string[],

  /**
   * `keydown` event handler.
   */
  onKeyDown?(e: KeyboardEvent, options: HotkeyEventOptions): any;

  /**
   * `keyup` event handler.
   */
  onKeyUp?(e: KeyboardEvent, options: HotkeyEventOptions): any;
}

export const HOTKEYS_MODULE = 'hotkeys';

export type IHotkeysModule = IModule<HTMLElement, 'onKeyDown' | 'onKeyUp'> & {
  reset: () => void,
  add: (...hotkeys: HotkeyConfigMod[]) => void,
  set: (...hotkeys: HotkeyConfigMod[]) => void,
  all: () => HotkeyConfigMod[],
  currentlyPressed: () => string[],
}

export const useHotkeys = (): IHotkeysModule => useModule(HOTKEYS_MODULE) as IHotkeysModule;

export const useHotkeysModule = (...initialHotkeys: HotkeyConfigMod[]): IHotkeysModule => {
  const [hotkeys, setHotkeys] = useState<HotkeyConfig[]>(initialHotkeys ?? []);

  /**
   * TODO: This is not perfect, out of focus ; skipping window, that kind of thing.. ; async calls to this ; delay ...
   */
  const [currentlyPressed, setCurrentlyPressed] = useState<PressedKeys>([]);

  // Hotkeys: https://blueprintjs.com/docs/#core/hooks/use-hotkeys
  const { handleKeyDown: onKeyDown, handleKeyUp: onKeyUp } = useBlueprintJSHotkeys(hotkeys, {
    showDialogKeyCombo: "?",
  });

  const setHotKeysMod = (hotkeys: HotkeyConfigMod[]): void => setHotkeys(
    hotkeys.flatMap(hotkey =>
      !_.isArray(hotkey.combo) ? hotkey : hotkey.combo.map(
        combo => <HotkeyConfig>{...hotkey, combo,}
      )
    ).map(hotkey => <HotkeyConfig>{
      ...hotkey,

      onKeyDown: (event) => {
        const pressed = _.compact(_.uniq(
          [
            ...currentlyPressed,
            event.key.toLowerCase(),
            event.metaKey ? 'meta' : undefined,
            event.ctrlKey ? 'ctrl' : undefined,
            event.altKey ? 'alt' : undefined,
            event.shiftKey ? 'shift' : undefined,
          ]
        ));

        setCurrentlyPressed(previous => _.compact(_.uniq(
          [
            ...previous,
            event.key.toLowerCase(),
            event.metaKey ? 'meta' : undefined,
            event.ctrlKey ? 'ctrl' : undefined,
            event.altKey ? 'alt' : undefined,
            event.shiftKey ? 'shift' : undefined,
          ]
        )));

        if (hotkey.onKeyDown) {
          hotkey.onKeyDown(event, { pressed });
        }
      },
      onKeyUp: (event) => {
        const exclude = _.compact(_.uniq([
          event.key.toLowerCase(),
          !event.metaKey ? 'meta' : undefined,
          !event.ctrlKey ? 'ctrl' : undefined,
          !event.altKey ? 'alt' : undefined,
          !event.shiftKey ? 'shift' : undefined,
        ]));
        const pressed = [...currentlyPressed.filter(key => !exclude.includes(key))];

        setCurrentlyPressed(previous => [...previous.filter(key => !exclude.includes(key))]);

        if (hotkey.onKeyUp) {
          hotkey.onKeyUp(event, { pressed });
        }
      }
    })
  )


  const module: IHotkeysModule = {
    identifier: HOTKEYS_MODULE,

    reset: () => setHotKeysMod(initialHotkeys),
    add: (...added: HotkeyConfigMod[]) => setHotKeysMod([...hotkeys, ...added]),
    set: (...hotkeys: HotkeyConfigMod[]) => setHotKeysMod([...hotkeys]),
    all: () => hotkeys,
    currentlyPressed: () => currentlyPressed,

    onKeyDown,
    onKeyUp
  }

  return module;
}

export default useHotkeysModule;