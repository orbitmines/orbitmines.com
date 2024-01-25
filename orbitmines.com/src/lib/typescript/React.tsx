import {ReactNode, useMemo} from "react";

export type Children = { children: ReactNode };

export type AllowReact<T> = {
  [TKey in keyof T]: T[TKey] extends string ? ReactNode : T[TKey];
}

export type Renderable<T> = T | { value: T, render: (value: T) => ReactNode };

// TODO ; Some directionality which takes this as a value, just any function to some other.
export const Rendered = ({renderable}: { renderable: Renderable<any>}) => {
  const rendered = useMemo(() => renderable?.render ? renderable.render(renderable.value) : renderable, [renderable]);

  return <>{rendered}</>;
}

export const value = (renderable: Renderable<any>) => renderable?.render ? renderable.value : renderable;

export function renderable<T extends ReactNode>(value: T, _default: (value: T) => ReactNode = (value) => value): Renderable<T> { return { value: value, render: _default }}

export type Predicate<T> = (value: T, index: number, array: T[]) => unknown;