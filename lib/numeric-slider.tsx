import React from "react";
import { float } from "./util";

export type NumericSliderProps = {
  id: string;
  label: string;
  onChange: (value: number) => void;
  value: number;
  min: number;
  max: number;
  step: number;
  valueSuffix?: string;
};

export const NumericSlider: React.FC<NumericSliderProps> = (props) => {
  return (
    <p>
      <label htmlFor={props.id}>{props.label}: </label>
      <input
        type="range"
        id={props.id}
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
    </p>
  );
};
