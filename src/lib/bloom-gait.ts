import { ease } from "./bloom-timing";

const stance = 0.6;

export function walkingFeet(progress: number, distance: number, steps: number, facing: number) {
  const travel = progress * distance;
  const stride = distance / (steps / 2);
  const strength = ease(progress, 0, 0.11) * (1 - ease(progress, 0.84, 1));
  return [0, 0.5].map((offset) => {
    const cycle = travel / stride + offset;
    const phase = cycle - Math.floor(cycle);
    const swing = ease(phase, stance, 1);
    const roll =
      0.15 * (1 - ease(phase, 0, 0.14)) -
      0.3 * ease(phase, 0.42, stance) +
      0.45 * ease(phase, stance, 1);
    return {
      x: facing * stride * (stance / 2 - phase + swing) * strength,
      lift: Math.sin(Math.PI * swing) * strength * 0.148,
      pitch: facing * roll * strength,
    };
  });
}

export function closingFeet(progress: number, distance: number, facing: number) {
  return [
    [0, 0.65],
    [0.42, 1],
  ].map(([start, end]) => {
    const swing = ease(progress, start!, end!);
    return {
      x: facing * distance * (swing - progress),
      lift: Math.sin(Math.PI * swing) * 0.102,
      pitch: facing * Math.sin(Math.PI * swing) * (swing - 0.75) * 0.44,
    };
  });
}
