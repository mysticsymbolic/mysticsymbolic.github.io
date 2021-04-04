import classNames from "classnames";
import React from "react";

type CheckboxProps = {
  label: string;
  onChange: (value: boolean) => void;
  value: boolean;
  disabled?: boolean;
};

export const Checkbox: React.FC<CheckboxProps> = (props) => {
  return (
    <label className={classNames("checkbox", { disabled: props.disabled })}>
      <input
        type="checkbox"
        checked={props.value}
        disabled={props.disabled}
        onChange={(e) => props.onChange(e.target.checked)}
      />{" "}
      {props.label}
    </label>
  );
};
