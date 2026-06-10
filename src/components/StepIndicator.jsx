/**
 * StepIndicator — shared horizontal wizard step stepper.
 *
 * Props:
 *   step        {number}   current 0-based step index
 *   labels      {string[]} array of step labels
 *   className   {string}   optional extra class on the wrapper
 */
import React from "react";
import "./StepIndicator.css";

export default function StepIndicator({ step = 0, labels = [], className = "" }) {
  return (
    <div className={`si-steps${className ? " " + className : ""}`} role="list" aria-label="Progress steps">
      {labels.map((label, i) => {
        const state = i === step ? "active" : i < step ? "done" : "";
        return (
          <React.Fragment key={label}>
            <div
              className={`si-step${state ? " is-" + state : ""}`}
              role="listitem"
              aria-current={i === step ? "step" : undefined}
            >
              <div className="si-step-circle" aria-hidden="true">
                {i < step ? "✓" : i + 1}
              </div>
              <span className="si-step-label">{label}</span>
            </div>
            {i < labels.length - 1 && (
              <div className={`si-connector${i < step ? " is-done" : ""}`} aria-hidden="true" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
