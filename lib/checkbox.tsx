import React from "react";

type CheckboxProps = {
  label: string;
  onChange: (value: boolean) => void;
  value: boolean;
};

export const Checkbox: React.FC<CheckboxProps> = (props) => {
  return (
    <label>
      <input
        type="checkbox"
        checked={props.value}
        onChange={(e) => props.onChange(e.target.checked)}
      />{" "}
      {props.label}
    </label>
  );
};
