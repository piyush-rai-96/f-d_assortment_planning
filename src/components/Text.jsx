import React from "react";
import "./primitives.css";

/*
 * Text — the project's single typography primitive. Every piece of copy goes
 * through here so sizes/weights/line-heights/colors come only from the token
 * scale (primitives.css), never ad-hoc values.
 *
 *   variant: display | title | heading | subheading | body | body-strong |
 *            caption | micro | kpi | overline
 *   tone:    default | strong | muted | subtle | primary | error | success |
 *            warning | info | accent | inherit
 *   as:      semantic element override (defaults are sensible per variant)
 */
const DEFAULT_TAG = {
  display: "h1",
  title: "h2",
  heading: "h3",
  subheading: "h4",
  body: "p",
  "body-strong": "p",
  caption: "span",
  micro: "span",
  kpi: "div",
  overline: "span",
};

export default function Text({
  variant = "body",
  tone = "default",
  as,
  mono = false,
  truncate = false,
  className = "",
  children,
  ...rest
}) {
  const Tag = as || DEFAULT_TAG[variant] || "span";
  const classes = [
    "fd-text",
    `fd-text--${variant}`,
    `fd-tone--${tone}`,
    mono ? "fd-text--mono" : "",
    truncate ? "fd-text--truncate" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
