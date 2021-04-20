import React from "react";
import { slugify } from "./util";
import { Vocabulary, VocabularyType } from "./vocabulary";

export type VocabularyWidgetProps<T extends VocabularyType> = {
  id?: string;
  label: string;
  value: T;
  onChange: (value: T) => void;
  choices: Vocabulary<T>;
};

export function VocabularyWidget<T extends VocabularyType>({
  id,
  label,
  value,
  onChange,
  choices,
}: VocabularyWidgetProps<T>) {
  id = id || slugify(label);

  return (
    <div className="flex-widget">
      <label htmlFor={id}>{label}: </label>
      <select
        id={id}
        onChange={(e) => onChange(choices.get(e.target.value))}
        value={value.name}
      >
        {choices.items.map((choice) => (
          <option key={choice.name} value={choice.name}>
            {choice.name}
          </option>
        ))}
      </select>
    </div>
  );
}
