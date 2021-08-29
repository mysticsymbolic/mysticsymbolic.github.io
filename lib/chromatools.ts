/*
Copyright (c) 2012-2021 Alexei Boronine
Copyright (c) 2016 Florian Dormont

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
*/

//Taken from hsluv haxe source transpiled to js: https://github.com/hsluv/hsluv/tree/master/haxe/src/hsluv

type Point = {
  x: number;
  y: number;
};

type Line = {
  slope: number;
  intercept: number;
};

type Angle = number;

type Intersection = {
  lineIndex1: number;
  lineIndex2: number;
  intersectionPoint: Point;
  intersectionPointAngle: Angle;
  relativeAngle: Angle;
};

export type UVSliceGeometery = {
  lines: Line[];
  verticies: Point[];
  angles: Angle[];
  outerCircleRadius: number;
  innerCircleRadius: number;
};

//XYZ2RGB
const m: number[][] = [
  [3.240969941904521, -1.537383177570093, -0.498610760293],
  [-0.96924363628087, 1.87596750150772, 0.041555057407175],
  [0.055630079696993, -0.20397695888897, 1.056971514242878],
];

/*
//RGB2XYZ
const minv: number[][] = [
  [0.41239079926595, 0.35758433938387, 0.18048078840183],
  [0.21263900587151, 0.71516867876775, 0.072192315360733],
  [0.019330818715591, 0.11919477979462, 0.95053215224966],
];


const refY = 1.0;
const refU = 0.19783000664283;
const refV = 0.46831999493879;
*/

const kappa = 903.2962962;
const epsilon = 0.0088564516;

function intersectLine(a: Line, b: Line): Point {
  let x = (a.intercept - b.intercept) / (b.slope - a.slope);
  let y = a.slope * x + a.intercept;
  return { x: x, y: y };
}

function distanceFromOrigin(p: Point): number {
  return Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2));
}

function distanceLineFromOrigin(l: Line) {
  return Math.abs(l.intercept) / Math.sqrt(Math.pow(l.slope, 2) + 1);
}

/*
function perpendicularThroughPoint(l: Line, p: Point) {
  let slope = -1 / l.slope;
  let intercept = p.y - slope * p.x;
  return { slope: slope, intercept: intercept };
}
*/

function normalizeAngle(ang: Angle) {
  let m = 2 * Math.PI;

  //This seems like you don't need to add the m...but it is necessary
  let nang = ((ang % m) + m) % m;
  return nang;
}

function angleFromOrigin(p: Point) {
  return Math.atan2(p.y, p.x);
}


function lengthOfRayUntilIntersect(theta: Angle, l: Line) {
  return l.intercept / (Math.sin(theta) - l.slope * Math.cos(theta));
}


function getBounds(L: number): Line[] {
  let result: Line[] = [];
  let sub1 = Math.pow(L + 16, 3) / 1560896;
  let sub2 = sub1 > epsilon ? sub1 : L / kappa;
  for (let i = 0; i < 3; i++) {
    let m1 = m[i][0];
    let m2 = m[i][1];
    let m3 = m[i][2];
    let top1 = (284517 * m1 - 94839 * m3) * sub2;
    let top2 = (838422 * m3 + 769860 * m2 + 731718 * m1) * L * sub2 - 0 * L;
    let bottom = (632260 * m3 - 126452 * m2) * sub2;
    result.push({ slope: top1 / bottom, intercept: top2 / bottom });
    let top11 = (284517 * m1 - 94839 * m3) * sub2;
    let top21 =
      (838422 * m3 + 769860 * m2 + 731718 * m1) * L * sub2 - 769860 * L;
    let bottom1 = (632260 * m3 - 126452 * m2) * sub2 + 126452;
    result.push({ slope: top11 / bottom1, intercept: top21 / bottom1 });
  }
  return result;
}


export function maxSafeChromaForL(L): number {
  let bounds = getBounds(L);
  let min = Infinity;

  for (let i = 0; i < bounds.length; i++) {
    let bound = bounds[i];
    let length = distanceLineFromOrigin(bound);
    min = Math.min(min, length);
  }
  return min;
}


export function maxChromaForLH(L: number, H: number): number {
  let hrad = (H / 360) * Math.PI * 2;
  let bounds = getBounds(L);
  let min = Infinity;

  for (let i = 0; i < bounds.length; i++) {
    let bound = bounds[i];
    var length = lengthOfRayUntilIntersect(hrad, bound);
    if (length >= 0) {
      min = Math.min(min, length);
    }
  }
  return min;
}

/*
function dotProduct(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++)
    while (_g < _g1) {
      sum += a[i] * b[i];
    }
  return sum;
}
*/

export function getUVSliceGeometery(L: number): UVSliceGeometery {
  // Array of lines
  let lines: Line[] = getBounds(L);
  let numLines = lines.length;
  let outerCircleRadius = 0.0;

  // Find the line closest to origin
  let closestLineIndex = -1;
  let closestLineDistance = Infinity;

  for (let i = 0; i < numLines; i++) {
    let d = distanceLineFromOrigin(lines[i]);
    if (closestLineDistance == null || d < closestLineDistance) {
      closestLineDistance = d;
      closestLineIndex = i;
    }
  }

  // For finding starting angle
  let closestLine: Line = lines[closestLineIndex];
  let perpendicularLine: Line = {
    slope: 0 - 1 / closestLine.slope,
    intercept: 0.0,
  };
  let intersectionPoint: Point = intersectLine(closestLine, perpendicularLine);
  let startingAngle: Angle = angleFromOrigin(intersectionPoint);

  // Get all intersections
  let intersections: Intersection[] = [];

  for (let i1 = 0; i1 < numLines - 1; i1++) {
    for (let i2 = i1 + 1; i2 < numLines; i2++) {
      let intersectionPoint: Point = intersectLine(lines[i1], lines[i2]);
      let intersectionPointAngle: Angle = angleFromOrigin(intersectionPoint);
      let relativeAngle = intersectionPointAngle - startingAngle;
      intersections.push({
        lineIndex1: i1,
        lineIndex2: i2,
        intersectionPoint: intersectionPoint,
        intersectionPointAngle: intersectionPointAngle,
        relativeAngle: normalizeAngle(relativeAngle),
      });
    }
  }

  //sort wrt to relative angle
  intersections.sort(function (a, b) {
    if (a.relativeAngle > b.relativeAngle) {
      return 1;
    } else {
      return -1;
    }
  });

  let orderedLines = [];
  let orderedVerticies = [];
  let orderedAngles = [];

  let nextLineIndex = null;
  let currentIntersection = null;
  let intersectionPointDistance = null;

  let currentLineIndex = closestLineIndex;
  let d = [];

  //in angle order, find the first intersection that occurs on the closest line, then find the other line on that intersection
  for (let i = 0; i < intersections.length; i++) {
    currentIntersection = intersections[i];
    nextLineIndex = null;
    if (currentIntersection.lineIndex1 == currentLineIndex) {
      nextLineIndex = currentIntersection.lineIndex2;
    } else if (currentIntersection.lineIndex2 == currentLineIndex) {
      nextLineIndex = currentIntersection.lineIndex1;
    }
    if (nextLineIndex != null) {
      currentLineIndex = nextLineIndex;

      d.push(currentLineIndex);
      orderedLines.push(lines[nextLineIndex]);
      orderedVerticies.push(currentIntersection.intersectionPoint);
      orderedAngles.push(currentIntersection.intersectionPointAngle);

      intersectionPointDistance = distanceFromOrigin(
        currentIntersection.intersectionPoint
      );
      if (intersectionPointDistance > outerCircleRadius) {
        outerCircleRadius = intersectionPointDistance;
      }
    }
  }

  return {
    lines: orderedLines,
    verticies: orderedVerticies,
    angles: orderedAngles,
    outerCircleRadius: outerCircleRadius,
    innerCircleRadius: closestLineDistance,
  };
}
