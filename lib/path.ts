import { Bezier } from "../vendor/bezier-js";
import { float } from "./util";

export function pathToShapes(path: string): Bezier[][] {
  const parts = path.trim().split(" ");
  let x = 0;
  let y = 0;
  let i = 0;
  const shapes: Bezier[][] = [];
  let currShape: Bezier[] = [];

  const chomp = () => {
    if (i >= parts.length) {
      throw new Error(`Ran out of path parts!`);
    }
    const val = parts[i];
    i++;
    return val;
  };

  const finishCurrShape = () => {
    if (currShape.length) {
      shapes.push(currShape);
      currShape = [];
    }
  };

  while (i < parts.length) {
    const command = chomp();
    switch (command) {
      case "M":
        finishCurrShape();
        x = float(chomp());
        y = float(chomp());
        break;
      case "C":
        const x1 = float(chomp());
        const y1 = float(chomp());
        const x2 = float(chomp());
        const y2 = float(chomp());
        const endX = float(chomp());
        const endY = float(chomp());
        currShape.push(new Bezier(x, y, x1, y1, x2, y2, endX, endY));
        x = endX;
        y = endY;
        break;
      case "Z":
        finishCurrShape();
        break;
      default:
        throw new Error(`Unknown SVG path command: '${command}'`);
    }
  }

  finishCurrShape();

  return shapes;
}
