import React from 'react';

// Shared wrapper for the bundled SVG icons. Each icon component below
// renders just the `<path>` etc. — the viewBox, sizing, and `fill` defaults
// live here so we don't repeat them on every icon.

type SvgProps = {
  size?: number;
  viewBox?: string;
  fill?: string;
  className?: string;
  children: React.ReactNode;
};

const Svg: React.FC<SvgProps> = ({
  size = 16,
  viewBox = '0 0 640 640',
  fill = 'currentColor',
  className,
  children,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={viewBox}
    width={size}
    height={size}
    fill={fill}
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export default Svg;
