import React from 'react';
import {Classes, IconSize, Intent} from "@blueprintjs/core";
import classNames from 'classnames';
import {uniqueId} from "lodash";
import brands, {SVG} from "../external/brands";

export type IconProps = {
  icon: string;
  children?: never;
  color?: string;
  htmlTitle?: string;
  size?: number;
  style?: React.CSSProperties;
  tagName?: keyof JSX.IntrinsicElements;
  title?: string | false | null;
  intent?: Intent;
}

const renderSvgPaths = (svg: SVG): JSX.Element[] | null => {
  const paths = svg.paths;
  if (paths == null) {
    return null;
  }
  return paths.map((path, i) => <path key={i} d={path} fillRule="evenodd" />);
}

const CustomIcon = (props: IconProps & Omit<React.HTMLAttributes<HTMLElement>, "title">) => {
  const {
    className,
    color,
    htmlTitle,
    intent,
    size = IconSize.STANDARD,
    title,
    tagName = "span",
    icon,
    ...htmlprops
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
      ...htmlprops,
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
    >
      {title && <title id={titleId}>{title}</title>}
      {paths}
    </svg>,
  );
}

export default CustomIcon;
// export {}