import * as THREE from "three";
import { ease } from "@/lib/bloom-timing";
import { artworkSprite, type ArtPoint, type ArtRect } from "./bloom-art-sprite";

export type WalkingLegArt = {
  frame: ArtRect;
  hip: ArtPoint;
  knee: ArtPoint;
  ankle: ArtPoint;
  heel: ArtPoint;
  toe: ArtPoint;
  shoeTop: number;
  scale: number;
};

type Foot = { x: number; lift: number; pitch: number };

export function makeWalkingLeg(texture: THREE.Texture, art: WalkingLegArt, rear: boolean) {
  const sprite = artworkSprite(texture, art.frame, art.ankle, art.scale, undefined, [18, 42]);
  const local = ([x, y]: ArtPoint) =>
    new THREE.Vector2((x - art.ankle[0]) * art.scale, (art.ankle[1] - y) * art.scale);
  const hip = local(art.hip);
  const knee = local(art.knee);
  const heel = local(art.heel);
  const toe = local(art.toe);
  const shoeTop = (art.ankle[1] - art.shoeTop) * art.scale;
  const positions = sprite.geometry.getAttribute("position");
  const vertices = Array.from({ length: positions.count }, (_, index) => {
    const x = positions.getX(index),
      y = positions.getY(index);
    return {
      x,
      y,
      thigh: ease(y, knee.y - 0.1, knee.y + 0.1),
      shoe: 1 - ease(y, shoeTop, shoeTop + 0.115),
    };
  });
  const top = art.frame[1];
  const fadeEnd = top + Math.min(92, art.frame[3] * 0.15);
  sprite.geometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(
      vertices.flatMap(({ y }) => [1, 1, 1, ease(art.ankle[1] - y / art.scale, top, fadeEnd)]),
      4,
    ),
  );
  sprite.material.vertexColors = true;
  sprite.renderOrder = rear ? -0.3 : -0.2;
  if (rear) sprite.material.color.setScalar(0.83);
  sprite.visible = false;
  return {
    sprite,
    positions,
    vertices,
    hip,
    knee,
    heel,
    toe,
    thighLength: hip.distanceTo(knee),
    shinLength: knee.length(),
  };
}

export function poseWalkingLeg(
  leg: ReturnType<typeof makeWalkingLeg>,
  foot: Foot,
  rest: number,
  rise: number,
  facing: number,
  opacity: number,
) {
  const { sprite, heel, toe, hip, knee, vertices, positions, thighLength, shinLength } = leg;
  sprite.visible = opacity > 0.001;
  if (!sprite.visible) return;
  sprite.material.opacity = opacity;

  const cosine = Math.cos(foot.pitch),
    sine = Math.sin(foot.pitch);
  const heelY = heel.x * sine + heel.y * cosine;
  const toeY = toe.x * sine + toe.y * cosine;
  const support = heelY < toeY ? heel : toe;
  const pivotX = support.x - (support.x * cosine - support.y * sine);
  const ankle = new THREE.Vector2(rest + foot.x + pivotX, foot.lift - Math.min(heelY, toeY));
  const posedHip = new THREE.Vector2(rest + hip.x, -Math.min(heel.y, toe.y) + hip.y + rise);
  const maxReach = thighLength + shinLength - 0.014;
  const dx = ankle.x - posedHip.x;
  posedHip.y = Math.min(
    posedHip.y,
    ankle.y + Math.sqrt(Math.max(0.025, maxReach * maxReach - dx * dx)),
  );
  const travel = ankle.clone().sub(posedHip);
  const length = Math.max(0.02, travel.length());
  travel.divideScalar(length);
  const projection =
    (thighLength * thighLength - shinLength * shinLength + length * length) / (2 * length);
  const flex = Math.sqrt(Math.max(0, thighLength * thighLength - projection * projection));
  const hinge = posedHip
    .clone()
    .addScaledVector(travel, projection)
    .addScaledVector(new THREE.Vector2(-travel.y, travel.x), facing * flex);
  const upperAngle =
    Math.atan2(hinge.y - posedHip.y, hinge.x - posedHip.x) -
    Math.atan2(knee.y - hip.y, knee.x - hip.x);
  const lowerAngle =
    Math.atan2(ankle.y - hinge.y, ankle.x - hinge.x) - Math.atan2(-knee.y, -knee.x);
  const uc = Math.cos(upperAngle),
    us = Math.sin(upperAngle);
  const lc = Math.cos(lowerAngle),
    ls = Math.sin(lowerAngle);
  for (const [index, vertex] of vertices.entries()) {
    const { x, y, thigh, shoe } = vertex;
    const aX = x - hip.x,
      aY = y - hip.y;
    const bX = x - knee.x,
      bY = y - knee.y;
    const upperX = posedHip.x + aX * uc - aY * us;
    const upperY = posedHip.y + aX * us + aY * uc;
    const lowerX = hinge.x + bX * lc - bY * ls;
    const lowerY = hinge.y + bX * ls + bY * lc;
    const shoeX = ankle.x + x * cosine - y * sine;
    const shoeY = ankle.y + x * sine + y * cosine;
    positions.setXY(
      index,
      THREE.MathUtils.lerp(THREE.MathUtils.lerp(lowerX, upperX, thigh), shoeX, shoe),
      THREE.MathUtils.lerp(THREE.MathUtils.lerp(lowerY, upperY, thigh), shoeY, shoe),
    );
  }
  positions.needsUpdate = true;
}
