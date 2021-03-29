import React from "react";
import { float, NumericRange, slugify } from "./util";

export type NumericSliderProps = NumericRange & {
  id?: string;
  label: string;
  onChange: (value: number) => void;
  value: number;
  valueSuffix?: string;
};

export const NumericSlider: React.FC<NumericSliderProps> = (props) => {
  const id = props.id || slugify(props.label);

  return (
    <div className="thingy numeric-slider">
      <label htmlFor={id}>{props.label}: </label>
      <span className="slider">
        <input
          type="range"
          id={id}
          min={props.min}
          max={props.max}
          value={props.value}
          step={props.step}
          onChange={(e) => props.onChange(float(e.target.value))}
        />
        <span>
          {" "}
          {props.value}
          {props.valueSuffix}
        </span>
      </span>
    </div>
  );
};
