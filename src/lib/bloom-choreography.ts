import { MathUtils, Vector3 } from "three";

import { ease } from "./bloom-timing";

export const contactStart = 4.92;
export const contactEnd = 5.15;
const { lerp } = MathUtils;
const point = (x: number, y: number, z: number) => new Vector3(x, y, z);

const exchange = point(0, 1.67, 0.39);
const chest = point(0.59, 1.65, 0.51);

export function storyPose(t: number) {
  const boyWalk = ease(t, 1.26, 2.55);
  const girlWalk = ease(t, 2.58, 3.85);
  const offer = ease(t, 4.05, contactStart);
  const take = ease(t, contactEnd, 5.73);
  const boyStep = ease(t, 4.03, 4.88);
  const girlStep = ease(t, 4.23, 4.91);
  const boyX = lerp(-4.5, -1.49, boyWalk) + 0.46 * boyStep;
  const girlX = lerp(4.5, 1.35, girlWalk) - 0.37 * girlStep;
  const walking = ease(boyWalk, 0, 0.12) * (1 - ease(boyWalk, 0.83, 1));
  const stride = boyWalk * Math.PI * 6;
  const sway = Math.cos(stride) * walking;
  const carry = point(
    boyX + 0.47 + 0.055 * sway,
    1.37 - 0.027 * Math.abs(Math.sin(stride)) * walking,
    0.38,
  );
  const bouquet = carry.lerp(exchange, offer).lerp(chest, take);
  const boyContact = 1 - ease(t, 5.11, 5.44);
  const girlContact = ease(t, 4.53, contactStart);
  const tilt = lerp(-0.16 + 0.08 * sway, -0.12, offer) + 0.27 * take;
  // The boy grips just below the ribbon knot and the girl takes the wrap above it.
  const wrapAt = (height: number) =>
    bouquet.clone().add(point(-Math.sin(tilt) * height, Math.cos(tilt) * height, 0));
  return {
    boyX,
    girlX,
    boyWalk,
    girlWalk,
    boyStep,
    girlStep,
    bouquet,
    boyPalm: wrapAt(-0.072),
    girlPalm: wrapAt(0.074),
    boyContact,
    girlContact,
    boyArmRaise: offer * boyContact,
    boyGrip: 1 - ease(t, 5.11, 5.26),
    girlGrip: ease(t, 4.78, 5.02),
    tilt,
    ribbonSway: sway * 0.2 + Math.sin(t * 7) * (0.028 + 0.085 * Math.sin(take * Math.PI)),
  };
}
