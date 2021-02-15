import React from "react";
import { Random } from "../random";
import { SvgVocabulary } from "../svg-vocabulary";

export const CreaturePage: React.FC<{}> = () => {
  const rand = new Random(1);
  const parts: string[] = [];

  for (let i = 0; i < 5; i++) {
    parts.push(rand.choice(SvgVocabulary).name);
  }

  return (
    <>
      <h1>Creature!</h1>
      <p>TODO: Make a creature with maybe the following parts:</p>
      <ul>
        {parts.map((name, i) => (
          <li key={i}>{name}</li>
        ))}
      </ul>
    </>
  );
};
