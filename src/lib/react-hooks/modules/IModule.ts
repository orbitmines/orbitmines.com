import IEventListener, {AllDOMAttributes} from "../IEventListener";
import {useContext} from "react";
import {ModulesContext} from "../../../App";

export const useModule = (identifier: string): IModule => {
  const modules = useContext(ModulesContext);
  for (let module of modules) {
    if (module.identifier === identifier)
      return module;
  }

  throw new Error("Unregistered module: " + identifier)
}

type IModule<
  T = Element,
  TKey extends keyof AllDOMAttributes<T> = keyof AllDOMAttributes<T>
> = IEventListener<T, TKey> & {
  identifier: string
};

export default IModule;