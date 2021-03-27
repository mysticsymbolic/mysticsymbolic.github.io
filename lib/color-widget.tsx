import React from "react";
import { slugify } from "./util";

type ColorWidgetProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id?: string;
};

export const ColorWidget: React.FC<ColorWidgetProps> = (props) => {
  const id = props.id || slugify(props.label);

  return (
    <>
      <label htmlFor={id}>{props.label}: </label>
      <input
        id={id}
        type="color"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </>
  );
};
