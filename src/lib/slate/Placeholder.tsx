import React from "react";
import {RenderPlaceholderProps} from "slate-react";

export type IPlaceholder = RenderPlaceholderProps | {
  children: any;
  attributes: {
    'data-slate-placeholder': boolean;
    dir?: 'rtl';
    contentEditable: boolean;
    ref: React.RefObject<any>;
    style: React.CSSProperties;
  };
}

export type PlaceholderRenderer = (props: IPlaceholder) => JSX.Element;

/**
 *
 *
 * @see https://github.com/ianstormtaylor/slate/blob/main/site/examples/custom-placeholder.tsx
 */
const Placeholder: PlaceholderRenderer = ({attributes, children}: IPlaceholder) => {

  return (
    <div {...attributes}>
      <p>{children}</p>
      <pre>
        Use the renderPlaceholder prop to customize rendering of the
        placeholder
      </pre>
    </div>
  )
}

export default Placeholder;