import React, {forwardRef} from 'react';
import {Classes, IconSize} from "@blueprintjs/core";
import classNames from 'classnames';
import {uniqueId} from "lodash";
import brands, {SVG} from "../external/brands";
import {SVGIconProps} from "@blueprintjs/icons";
import {IntentProps, Props} from "@blueprintjs/core/src/common";

export interface IconProps extends IntentProps, Props, SVGIconProps {
  icon: string;

  tagName?: keyof JSX.IntrinsicElements;

  /** Props to apply to the `SVG` element */
  svgProps?: React.HTMLAttributes<SVGElement>;
}

const renderSvgPaths = (svg: SVG): JSX.Element[] | null => {
  const paths = svg.paths;
  if (paths == null) {
    return null;
  }
  return paths.map((path, i) => <path key={i} d={path} fillRule="evenodd" />);
}

const CustomIcon: React.FC<IconProps & Omit<React.HTMLAttributes<HTMLElement>, "title">> = (props) => {
  const {
    className,
    color,
    htmlTitle,
    intent,
    size = IconSize.STANDARD,
    title,
    tagName = "span",
    icon,

    svgProps,
    ...htmlProps
  } = props;

  const svg = brands[icon].assets.icon;
  // render path elements, or nothing if icon name is unknown.
  const paths = renderSvgPaths(svg);

  const classes = classNames(Classes.ICON, Classes.iconClass(icon), Classes.intentClass(intent), className);
  const viewBox = `0 0 ${svg.viewBox.width} ${svg.viewBox.height}`;

  const titleId = uniqueId("iconTitleCustom");

  return React.createElement(
      tagName,
      {
        ...htmlProps,
        "aria-hidden": title ? undefined : true,
        className: classes,
        title: htmlTitle,
      },
      <svg
          fill={color}
          data-icon={icon}
          width={size}
          height={size}
          viewBox={viewBox}
          aria-labelledby={title ? titleId : undefined}
          role="img"
          style={{transform: 'scaleY(1)'}} // something in bp5 scaleY(-1)?
      >
        {title && <title id={titleId}>{title}</title>}
        {paths}
      </svg>,
  );
};

export default CustomIcon;
// export {}