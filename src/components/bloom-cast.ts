import * as THREE from "three";
import { ease } from "@/lib/bloom-timing";
import { closingFeet, walkingFeet } from "@/lib/bloom-gait";
import { artworkSprite, type ArtRect } from "./bloom-art-sprite";
import { makeWalkingLeg, poseWalkingLeg, type WalkingLegArt } from "./bloom-walk-rig";

type Point = readonly [number, number];

export type CharacterArt = {
  frame: readonly [number, number, number, number];
  ground: Point;
  shoulder: Point;
  elbow: Point;
  grip: Point;
  gripWrist: Point;
  freeShoulder: Point;
  freeWrist: Point;
  restingWrist: Point;
  restingHand: readonly Point[];
  tuckedSleeveEdge?: readonly [Point, Point, Point, Point];
  restingAnkles: readonly [number, number];
  legFade: readonly [number, number];
  handOutline?: Point;
  entryDistance: number;
  closingDistance: number;
  skirt?: boolean;
  height: number;
  facing: 1 | -1;
};
export type GripArt = { frame: ArtRect; anchor: Point; wrist: Point; scale: number };

const mix = THREE.MathUtils.lerp;
const limit = THREE.MathUtils.clamp;

export function makeIllustratedCharacter(
  texture: THREE.Texture,
  art: CharacterArt,
  handTexture: THREE.Texture,
  hand: GripArt,
  legTexture: THREE.Texture,
  legArt: WalkingLegArt,
) {
  const [left, top, width, height] = art.frame;
  const [groundX, groundY] = art.ground;
  const scale = art.height / (groundY - top);
  const local = ([x, y]: Point) => new THREE.Vector2((x - groundX) * scale, (groundY - y) * scale);
  const shoulder = local(art.shoulder);
  const elbow = local(art.elbow);
  const grip = local(art.grip);
  const gripWrist = local(art.gripWrist);
  const forearm = grip.clone().sub(elbow);
  const freeShoulder = local(art.freeShoulder);
  const freeWrist = local(art.freeWrist);
  const image = texture.image as { width: number; height: number };
  const geometry = new THREE.PlaneGeometry(width * scale, height * scale, 54, 68);
  geometry.translate((left + width / 2 - groundX) * scale, (groundY - top - height / 2) * scale, 0);
  const positions = geometry.getAttribute("position");
  const uv = geometry.getAttribute("uv");
  for (let index = 0; index < uv.count; index++) {
    uv.setXY(
      index,
      (left + width * uv.getX(index)) / image.width,
      1 - (top + height * (1 - uv.getY(index))) / image.height,
    );
  }
  const legCut = {
    value: new THREE.Vector3(art.legFade[0] / image.height, art.legFade[1] / image.height, 0),
  };
  const handOutline = {
    value: new THREE.Vector2(
      (art.handOutline?.[0] ?? -20) / image.width,
      (art.handOutline?.[1] ?? 0) / image.height,
    ),
  };
  const legs = art.restingAnkles.map((x, index) => ({
    rest: (x - groundX) * scale,
    ...makeWalkingLeg(legTexture, legArt, index === (art.facing > 0 ? 1 : 0)),
  }));

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.012,
    depthWrite: false,
    toneMapped: false,
  });
  const figure = new THREE.Mesh(geometry, material);
  figure.frustumCulled = false;
  const root = new THREE.Group();
  root.add(...legs.map(({ sprite }) => sprite), figure);
  const handCut = {
    value: new THREE.Vector4(0, art.facing, 0, 0),
  };
  const edge = art.tuckedSleeveEdge ?? [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ];
  const sleeveEdgeX = {
    value: new THREE.Vector4().fromArray(edge.map(([x]) => x / image.width)),
  };
  const sleeveEdgeY = {
    value: new THREE.Vector4().fromArray(edge.map(([, y]) => y / image.height)),
  };
  const sleeveTuck = { value: 0 };
  material.onBeforeCompile = (shader) => {
    shader.uniforms["handCut"] = handCut;
    shader.uniforms["legCut"] = legCut;
    shader.uniforms["handOutline"] = handOutline;
    shader.uniforms["sleeveEdgeX"] = sleeveEdgeX;
    shader.uniforms["sleeveEdgeY"] = sleeveEdgeY;
    shader.uniforms["sleeveTuck"] = sleeveTuck;
    shader.fragmentShader =
      "uniform vec4 handCut;\nuniform vec3 legCut;\nuniform vec2 handOutline;\nuniform vec4 sleeveEdgeX;\nuniform vec4 sleeveEdgeY;\nuniform float sleeveTuck;\n" +
      shader.fragmentShader.replace(
        "#include <map_fragment>",
        "#include <map_fragment>\n" +
          "diffuseColor.a *= 1.0 - handCut.z * smoothstep(handCut.x, handCut.x + handCut.w, vMapUv.x * handCut.y);\n" +
          "float atlasY = 1.0 - vMapUv.y;\n" +
          "float sleeveSide = mix(sleeveEdgeX.x, sleeveEdgeX.y, smoothstep(sleeveEdgeY.x, sleeveEdgeY.y, atlasY));\n" +
          "sleeveSide += (sleeveEdgeX.z - sleeveEdgeX.y) * smoothstep(sleeveEdgeY.y, sleeveEdgeY.z, atlasY);\n" +
          "sleeveSide += (sleeveEdgeX.w - sleeveEdgeX.z) * smoothstep(sleeveEdgeY.z, sleeveEdgeY.w, atlasY);\n" +
          "float sleeveRange = smoothstep(sleeveEdgeY.x - 0.024, sleeveEdgeY.x, atlasY) * (1.0 - smoothstep(sleeveEdgeY.w, sleeveEdgeY.w + 0.019, atlasY));\n" +
          "diffuseColor.a *= 1.0 - sleeveTuck * sleeveRange * smoothstep(sleeveSide, sleeveSide + 0.0011, vMapUv.x);\n" +
          "float keepHand = (1.0 - smoothstep(handOutline.x - 0.004, handOutline.x + 0.004, vMapUv.x)) * (1.0 - smoothstep(handOutline.y - 0.008, handOutline.y + 0.006, 1.0 - vMapUv.y));\n" +
          "diffuseColor.a *= 1.0 - (1.0 - keepHand) * legCut.z * smoothstep(legCut.x, legCut.y, 1.0 - vMapUv.y);",
      );
  };
  const [restX, restY] = art.restingWrist;
  // The opposite hand in the illustration is already painted with relaxed fingers.
  const restGeometry = new THREE.ShapeGeometry(
    new THREE.Shape(
      art.restingHand.map(([x, y]) => new THREE.Vector2((restX - x) * scale, (restY - y) * scale)),
    ),
  );
  const restPositions = restGeometry.getAttribute("position");
  const restUv = restGeometry.getAttribute("uv");
  for (let index = 0; index < restUv.count; index++) {
    restUv.setXY(
      index,
      (restX - restPositions.getX(index) / scale) / image.width,
      1 - (restY - restPositions.getY(index) / scale) / image.height,
    );
  }
  const restingHand = new THREE.Mesh(
    restGeometry,
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
    }),
  );
  const wristBlend = {
    value: new THREE.Vector2((restY - 8) / image.height, (restY + 8) / image.height),
  };
  restingHand.material.onBeforeCompile = (shader) => {
    shader.uniforms["wristBlend"] = wristBlend;
    shader.fragmentShader =
      "uniform vec2 wristBlend;\n" +
      shader.fragmentShader.replace(
        "#include <map_fragment>",
        "#include <map_fragment>\n" +
          "diffuseColor.a *= smoothstep(wristBlend.x, wristBlend.y, 1.0 - vMapUv.y);",
      );
  };
  restingHand.renderOrder = 2;
  restingHand.scale.set(0.82, 0.91, 1);
  root.add(restingHand);
  const { width: handWidth } = handTexture.image as { width: number };
  const wristEdge = hand.wrist[0] * art.facing;
  const fingers = artworkSprite(
    handTexture,
    hand.frame,
    hand.anchor,
    hand.scale,
    new THREE.Vector3((wristEdge - 27) / handWidth, (wristEdge + 115) / handWidth, art.facing),
  );
  fingers.renderOrder = 4;
  fingers.material.depthTest = false;
  fingers.visible = false;
  const fingersDirection = Math.atan2(
    hand.wrist[1] - hand.anchor[1],
    hand.anchor[0] - hand.wrist[0],
  );
  fingers.geometry.rotateZ(-fingersDirection);
  const fingersLength =
    Math.hypot(hand.anchor[0] - hand.wrist[0], hand.anchor[1] - hand.wrist[1]) * hand.scale;
  root.add(fingers);

  const reach = art.facing * (grip.x - shoulder.x);
  const alongArm = (x: number) =>
    limit((art.facing * (x - shoulder.x)) / Math.max(0.08, reach), 0, 1);
  const elbowAlong = alongArm(elbow.x);
  const wristAlong = alongArm(gripWrist.x);
  const armSection = (x: number, y: number) => {
    const along = alongArm(x);
    const armLine =
      along < 0.52
        ? mix(shoulder.y, elbow.y, along / 0.52)
        : mix(elbow.y, grip.y, (along - 0.52) / 0.48);
    return {
      along,
      sleeve: 1 - ease(Math.abs(y - armLine), 0.16, 0.43),
    };
  };
  const weightAt = (point: THREE.Vector2) => {
    const { along, sleeve } = armSection(point.x, point.y);
    return ease(along, 0, 0.94) * sleeve;
  };
  const wristWeight = weightAt(gripWrist);
  const elbowWeight = weightAt(elbow);
  const coordinates = Array.from({ length: positions.count }, (_, index) => {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const { along, sleeve } = armSection(x, y);
    const weight = ease(along, 0, 0.94) * sleeve;
    const elbowInfluence =
      ease(along, 0, elbowAlong) * (1 - ease(along, elbowAlong, wristAlong)) * sleeve;
    const freeReach = ease(freeShoulder.y - y, 0.08, freeShoulder.y - freeWrist.y);
    const freeX = mix(freeShoulder.x, freeWrist.x, freeReach);
    const freeWeight =
      freeReach *
      (1 - ease(Math.abs(x - freeX), 0.07, 0.18)) *
      ease(y, freeWrist.y - 0.3, freeWrist.y - 0.1);
    const upper = ease(y, 0.25, 1.4);
    const fabric = art.skirt ? ease(y, 0.2, 0.43) * (1 - ease(y, 0.64, 1.6)) : 0;
    return {
      x,
      y,
      weight,
      elbowInfluence,
      freeWeight,
      upper,
      fabric,
      breathWeight: ease(y, 1.2, art.height),
    };
  });

  return {
    root,
    geometry,
    material,
    positions,
    coordinates,
    shoulder,
    elbow,
    elbowWeight,
    grip,
    gripWrist,
    forearm,
    art,
    handCut,
    sleeveTuck,
    legCut,
    legs,
    restingHand,
    wristU: (art.gripWrist[0] * art.facing) / image.width,
    pixelU: 1 / image.width,
    fingers,
    fingersLength,
    wristWeight,
  };
}

export function poseIllustratedCharacter(
  figure: ReturnType<typeof makeIllustratedCharacter>,
  x: number,
  walk: number,
  step: number,
  time: number,
  contact: number,
  gripAmount: number,
  target: THREE.Vector3,
  armRaise: number,
) {
  const {
    root,
    art,
    positions,
    coordinates,
    shoulder,
    elbow,
    elbowWeight,
    forearm,
    grip,
    gripWrist,
    restingHand,
    wristU,
    pixelU,
    fingers,
    fingersLength,
    wristWeight,
    handCut,
    sleeveTuck,
    legCut,
    legs,
  } = figure;
  const steps = 6;
  const active = ease(walk, 0, 0.11) * (1 - ease(walk, 0.84, 1));
  const stride = walk * Math.PI * steps;
  const swing = Math.cos(stride) * active;
  const approach = walkingFeet(walk, art.entryDistance, steps, art.facing);
  const close = closingFeet(step, art.closingDistance, art.facing);
  const feet = approach.map((foot, index) => ({
    x: foot.x + close[index]!.x,
    lift: foot.lift + close[index]!.lift,
    pitch: foot.pitch + close[index]!.pitch,
  }));
  if (art.facing < 0) feet.reverse();
  const rise = -0.028 * Math.abs(Math.sin(stride)) * active - 0.018 * Math.sin(step * Math.PI);
  root.position.set(x, 0, 0.34);
  const walkBlend = ease(walk, 0, 0.075) * (1 - ease(walk, 0.89, 1));
  const stepBlend = ease(step, 0, 0.11) * (1 - ease(step, 0.86, 1));
  const legBlend = Math.max(walkBlend, stepBlend);
  legCut.value.z = legBlend;
  for (const [index, leg] of legs.entries()) {
    poseWalkingLeg(leg, feet[index]!, leg.rest, rise, art.facing, legBlend);
  }
  const breath = Math.sin(time * 5.1) * 0.018;
  const tuckedGrip = new THREE.Vector2(
    grip.x - art.facing * (0.54 + swing * 0.14),
    grip.y - 0.64 + 0.07 * Math.abs(swing),
  );
  const wrist = tuckedGrip.lerp(new THREE.Vector2(target.x - x, target.y), contact);
  const movement = wrist.clone().sub(grip);
  const posedElbow = elbow.clone().addScaledVector(movement, 0.27);
  const posedForearm = wrist.clone().sub(posedElbow);
  const baseLength = Math.max(0.001, forearm.lengthSq());
  const cosine = forearm.dot(posedForearm) / baseLength;
  const sine = forearm.cross(posedForearm) / baseLength;
  const closed = gripAmount * ease(contact, 0.72, 1);
  const relaxed = 1 - ease(contact, 0.24, 0.55);
  sleeveTuck.value = art.tuckedSleeveEdge ? 1 - ease(contact, 0.08, 0.49) : 0;
  handCut.value.x = wristU + mix(11, -11, relaxed) * pixelU;
  handCut.value.z = Math.max(relaxed, closed);
  handCut.value.w = mix(0.032, 12 * pixelU, relaxed);
  const dx = gripWrist.x - elbow.x;
  const dy = gripWrist.y - elbow.y;
  const wristBob =
    (rise * ease(gripWrist.y, 0.25, 1.4) + breath * ease(gripWrist.y, 1.2, art.height)) *
    (1 - wristWeight * contact);
  const jointX = mix(gripWrist.x, posedElbow.x + cosine * dx - sine * dy, wristWeight);
  const jointY = mix(gripWrist.y, posedElbow.y + sine * dx + cosine * dy, wristWeight) + wristBob;
  const elbowX = mix(elbow.x, posedElbow.x, elbowWeight);
  const elbowY = mix(elbow.y, posedElbow.y, elbowWeight);
  const elbowProgress = limit((shoulder.y - elbowY) / Math.max(0.05, shoulder.y - jointY), 0, 1);
  const straightElbowX = mix(shoulder.x, jointX, elbowProgress);
  const elbowCorrection = (straightElbowX - elbowX) * (1 - ease(armRaise, 0.06, 0.92));
  const armVisibility = 1 - sleeveTuck.value;
  const handOpacity = relaxed * armVisibility;
  restingHand.visible = handOpacity > 0.001;
  restingHand.material.opacity = handOpacity;
  const wristAngle = limit(
    Math.atan2(jointX - elbowX - elbowCorrection, elbowY - jointY),
    -0.32,
    0.32,
  );
  const wristOverlap = 0.035;
  restingHand.position.set(
    jointX - Math.sin(wristAngle) * wristOverlap,
    jointY + Math.cos(wristAngle) * wristOverlap,
    0.04,
  );
  restingHand.rotation.z = mix(wristAngle, art.facing * 0.42, contact);
  fingers.visible = closed > 0.001;
  if (fingers.visible) {
    const holdX = wrist.x - jointX;
    const holdY = wrist.y - jointY;
    fingers.position.set(wrist.x, wrist.y, 0.05);
    fingers.rotation.z = Math.atan2(holdY, holdX);
    fingers.scale.x = limit((Math.hypot(holdX, holdY) / fingersLength) * 1.14, 0.68, 1.67);
    fingers.material.opacity = closed;
  }

  for (const [index, vertex] of coordinates.entries()) {
    const { x: px, y: py, weight, freeWeight, upper, fabric, breathWeight } = vertex;
    const offsetX = px - elbow.x;
    const offsetY = py - elbow.y;
    const adjustedX = posedElbow.x + cosine * offsetX - sine * offsetY;
    const adjustedY = posedElbow.y + sine * offsetX + cosine * offsetY;
    positions.setXYZ(
      index,
      px +
        ((adjustedX - px) * weight + elbowCorrection * vertex.elbowInfluence) * armVisibility +
        art.facing * swing * (freeWeight * 0.1 + fabric * 0.052 - upper * 0.014) * (1 - weight),
      py +
        (adjustedY - py) * weight * armVisibility +
        (rise * upper + breath * breathWeight) * (1 - weight * contact),
      0,
    );
  }
  positions.needsUpdate = true;
}
