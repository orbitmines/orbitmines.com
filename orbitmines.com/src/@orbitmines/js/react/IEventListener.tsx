import React, {
  AnimationEventHandler,
  ClipboardEventHandler,
  CompositionEventHandler,
  DOMAttributes,
  DragEventHandler,
  EventHandler,
  FocusEventHandler,
  FormEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  PointerEventHandler,
  ReactEventHandler,
  SyntheticEvent,
  TouchEventHandler, TransitionEventHandler, UIEventHandler,
  useMemo, WheelEventHandler
} from 'react';
import _ from "lodash";

export type IEventHandler<T = Element> = EventHandler<SyntheticEvent<T>>;

// TODO Do this at compile time
export const events = () => [
  // Clipboard Events
  "onCopy",
  "onCopyCapture",
  "onCut",
  "onCutCapture",
  "onPaste",
  "onPasteCapture",

  // Composition Events
  "onCompositionEnd",
  "onCompositionEndCapture",
  "onCompositionStart",
  "onCompositionStartCapture",
  "onCompositionUpdate",
  "onCompositionUpdateCapture",

  // Focus Events
  "onFocus",
  "onFocusCapture",
  "onBlur",
  "onBlurCapture",

  // Form Events
  "onChange",
  "onChangeCapture",
  "onBeforeInput",
  "onBeforeInputCapture",
  "onInput",
  "onInputCapture",
  "onReset",
  "onResetCapture",
  "onSubmit",
  "onSubmitCapture",
  "onInvalid",
  "onInvalidCapture",

  // Image Events
  "onLoad",
  "onLoadCapture",
  "onError",
  "onErrorCapture",

  // Keyboard Events
  "onKeyDown",
  "onKeyDownCapture",
  /** @deprecated */
  "onKeyPress",
  /** @deprecated */
  "onKeyPressCapture",
  "onKeyUp",
  "onKeyUpCapture",

  // Media Events
  "onAbort",
  "onAbortCapture",
  "onCanPlay",
  "onCanPlayCapture",
  "onCanPlayThrough",
  "onCanPlayThroughCapture",
  "onDurationChange",
  "onDurationChangeCapture",
  "onEmptied",
  "onEmptiedCapture",
  "onEncrypted",
  "onEncryptedCapture",
  "onEnded",
  "onEndedCapture",
  "onLoadedData",
  "onLoadedDataCapture",
  "onLoadedMetadata",
  "onLoadedMetadataCapture",
  "onLoadStart",
  "onLoadStartCapture",
  "onPause",
  "onPauseCapture",
  "onPlay",
  "onPlayCapture",
  "onPlaying",
  "onPlayingCapture",
  "onProgress",
  "onProgressCapture",
  "onRateChange",
  "onRateChangeCapture",
  "onResize",
  "onResizeCapture",
  "onSeeked",
  "onSeekedCapture",
  "onSeeking",
  "onSeekingCapture",
  "onStalled",
  "onStalledCapture",
  "onSuspend",
  "onSuspendCapture",
  "onTimeUpdate",
  "onTimeUpdateCapture",
  "onVolumeChange",
  "onVolumeChangeCapture",
  "onWaiting",
  "onWaitingCapture",

  // MouseEvents
  "onAuxClick",
  "onAuxClickCapture",
  "onClick",
  "onClickCapture",
  "onContextMenu",
  "onContextMenuCapture",
  "onDoubleClick",
  "onDoubleClickCapture",
  "onDrag",
  "onDragCapture",
  "onDragEnd",
  "onDragEndCapture",
  "onDragEnter",
  "onDragEnterCapture",
  "onDragExit",
  "onDragExitCapture",
  "onDragLeave",
  "onDragLeaveCapture",
  "onDragOver",
  "onDragOverCapture",
  "onDragStart",
  "onDragStartCapture",
  "onDrop",
  "onDropCapture",
  "onMouseDown",
  "onMouseDownCapture",
  "onMouseEnter",
  "onMouseLeave",
  "onMouseMove",
  "onMouseMoveCapture",
  "onMouseOut",
  "onMouseOutCapture",
  "onMouseOver",
  "onMouseOverCapture",
  "onMouseUp",
  "onMouseUpCapture",

  // Selection Events
  "onSelect",
  "onSelectCapture",

  // Touch Events
  "onTouchCancel",
  "onTouchCancelCapture",
  "onTouchEnd",
  "onTouchEndCapture",
  "onTouchMove",
  "onTouchMoveCapture",
  "onTouchStart",
  "onTouchStartCapture",

  // Pointer Events
  "onPointerDown",
  "onPointerDownCapture",
  "onPointerMove",
  "onPointerMoveCapture",
  "onPointerUp",
  "onPointerUpCapture",
  "onPointerCancel",
  "onPointerCancelCapture",
  "onPointerEnter",
  "onPointerEnterCapture",
  "onPointerLeave",
  "onPointerLeaveCapture",
  "onPointerOver",
  "onPointerOverCapture",
  "onPointerOut",
  "onPointerOutCapture",
  "onGotPointerCapture",
  "onGotPointerCaptureCapture",
  "onLostPointerCapture",
  "onLostPointerCaptureCapture",

  // UI Events
  "onScroll",
  "onScrollCapture",

  // Wheel Events
  "onWheel",
  "onWheelCapture",

  // Animation Events
  "onAnimationStart",
  "onAnimationStartCapture",
  "onAnimationEnd",
  "onAnimationEndCapture",
  "onAnimationIteration",
  "onAnimationIterationCapture",

  // Transition Events
  "onTransitionEnd",
  "onTransitionEndCapture",
]

export type AllDOMAttributes<T = Element> = Required<DOMAttributes<T>>;
type IEventListener<T, TKey extends keyof AllDOMAttributes<T> = keyof AllDOMAttributes<T>> = {
  [TProperty in keyof Pick<AllDOMAttributes<T>, TKey>]?: AllDOMAttributes<T>[TProperty] extends IEventHandler<T> ? AllDOMAttributes<T>[TProperty] : never
}
export default IEventListener;


// export function eventKeys<T = ArbitraryElement>(): (keyof IEvents<T>)[] {
//   return keys<IEvents<T>>();
// }

export type EventHandlers<T = Element> = { [key: string]: IEventHandler<T> };
export function getHandlers<T = Element>(listener: IEventListener<T, any>): EventHandlers<T> {
  return _.pickBy(listener, (value, key) => {
    return value !== undefined && value as IEventHandler<T> && key.startsWith('on'); //TODO Fix this
  }) as any;
}

export function allEventsListener<T = Element>(handler: IEventHandler<T>): IEventListener<T> {
  const listener: IEventListener<T> = {};
  // @ts-ignore
  events().forEach(key => listener[key] = handler);
  return listener;
}

export function mergeListeners<T = Element>(...listeners: IEventListener<T, any>[]): IEventListener<T> {
  const groupedByKey: { [key: string]: IEventHandler<T>[] } = _.mergeWith(
    {}, ...listeners.map(getHandlers), (left: any, right: any) => (left || []).concat(right)
  );

  const listener: IEventListener<T> = {};
  _.entries(groupedByKey).forEach(([key, handlers]) => {
    // @ts-ignore
    listener[key] = (event) => handlers.forEach(handler => handler(event));
  });
  return listener;
}

export function useListeners<T = Element>(...listeners: IEventListener<T, any>[]): IEventListener<T> {
  const listener = useMemo(() => mergeListeners(...listeners), []); //TODO Allow listeners to be changed
  return listener;
}