import {useState} from "react";
import IModule, {useModule} from "./IModule";

export const HOVERING_MODULE = 'hovering';

export type IHoveringModule<T = Element> = IModule<T, 'onMouseOver' | 'onMouseOut'> & {
  isTarget: (element?: T) => boolean;
  within: (element?: T) => boolean;
}

export const useHovering = <T = Element>(): IHoveringModule<T> => useModule(HOVERING_MODULE) as IHoveringModule<T>;

export const useHoveringModule = <T extends Element>(): IHoveringModule<T> => {
  const [target, setTarget] = useState<T | null>(null);

  const module: IHoveringModule<T> = {
    identifier: HOVERING_MODULE,

    isTarget: (element?: T): boolean => target === element,
    within: (element?: T): boolean => !!target && !!element && element.contains(target),

    onMouseOver: (event) => setTarget(event.target as T),
    onMouseOut: (event) => {},
  }

  return module;
}

export default useHoveringModule;