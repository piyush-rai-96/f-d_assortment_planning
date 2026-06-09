import React from "react";
import "./primitives.css";

/*
 * Stack — flex layout primitive. Spacing comes from the token scale only:
 * `gap`, `padding`, `paddingX/Y` accept a step number (1,2,3,4,5,6,8,10)
 * that resolves to var(--sp-N). No raw pixel margins in views.
 */
const sp = (n) => (n == null ? undefined : `var(--sp-${n})`);

export default function Stack({
  direction = "column",
  gap = 0,
  align,
  justify,
  wrap = false,
  flex,
  padding,
  paddingX,
  paddingY,
  as: Tag = "div",
  style,
  className = "",
  children,
  ...rest
}) {
  const merged = {
    flexDirection: direction,
    gap: sp(gap),
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap ? "wrap" : undefined,
    flex,
    padding: padding != null ? sp(padding) : undefined,
    paddingLeft: paddingX != null ? sp(paddingX) : undefined,
    paddingRight: paddingX != null ? sp(paddingX) : undefined,
    paddingTop: paddingY != null ? sp(paddingY) : undefined,
    paddingBottom: paddingY != null ? sp(paddingY) : undefined,
    ...style,
  };

  return (
    <Tag className={`fd-stack ${className}`.trim()} style={merged} {...rest}>
      {children}
    </Tag>
  );
}
