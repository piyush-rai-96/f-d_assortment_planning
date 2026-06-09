import React from "react";
import "./primitives.css";

/*
 * Grid — CSS-grid layout primitive. Spacing from the token scale (`gap` step).
 * Provide EITHER:
 *   - `min`: responsive auto-fit columns, each at least `min` wide
 *            (preferred — no media queries needed), or
 *   - `columns`: a fixed column count / template string.
 */
const sp = (n) => (n == null ? undefined : `var(--sp-${n})`);

export default function Grid({
  columns,
  min,
  gap = 4,
  align,
  flex,
  as: Tag = "div",
  style,
  className = "",
  children,
  ...rest
}) {
  let templateColumns;
  if (min) {
    templateColumns = `repeat(auto-fit, minmax(${typeof min === "number" ? `${min}px` : min}, 1fr))`;
  } else if (typeof columns === "number") {
    templateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  } else if (typeof columns === "string") {
    templateColumns = columns;
  }

  const merged = {
    gridTemplateColumns: templateColumns,
    gap: sp(gap),
    alignItems: align,
    flex,
    ...style,
  };

  return (
    <Tag className={`fd-grid ${className}`.trim()} style={merged} {...rest}>
      {children}
    </Tag>
  );
}
