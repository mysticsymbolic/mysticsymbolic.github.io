import React from "react";

type ColorWidgetProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id: string;
};

export const ColorWidget: React.FC<ColorWidgetProps> = (props) => (
  <>
    <label htmlFor={props.id}>{props.label}: </label>
    <input
      id={props.id}
      type="color"
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
    />
  </>
);
