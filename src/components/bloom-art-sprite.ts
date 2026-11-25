import * as THREE from "three";

export type ArtRect = readonly [number, number, number, number];
export type ArtPoint = readonly [number, number];

export function prepareArtwork(texture: THREE.Texture) {
  if (texture.colorSpace !== THREE.SRGBColorSpace) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }
  return texture;
}

export function artworkSprite(
  texture: THREE.Texture,
  frame: ArtRect,
  anchor: ArtPoint,
  scale: number,
  wristFade = new THREE.Vector3(-2, -1, 1),
  segments: readonly [number, number] = [1, 1],
) {
  const [left, top, width, height] = frame;
  const geometry = new THREE.PlaneGeometry(width * scale, height * scale, ...segments);
  geometry.translate(
    (left + width / 2 - anchor[0]) * scale,
    (anchor[1] - top - height / 2) * scale,
    0,
  );
  const image = texture.image as { width: number; height: number };
  const uv = geometry.getAttribute("uv");
  for (let index = 0; index < uv.count; index++) {
    uv.setXY(
      index,
      (left + width * uv.getX(index)) / image.width,
      1 - (top + height * (1 - uv.getY(index))) / image.height,
    );
  }
  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    alphaTest: 0.012,
    depthWrite: false,
    toneMapped: false,
    map: texture,
  });
  const sprite = new THREE.Mesh(geometry, material);
  material.onBeforeCompile = (shader) => {
    shader.uniforms["wristFade"] = { value: wristFade };
    shader.fragmentShader =
      "uniform vec3 wristFade;\n" +
      shader.fragmentShader.replace(
        "#include <map_fragment>",
        "#include <map_fragment>\n" +
          "diffuseColor.a = opacity * smoothstep(0.29, 0.74, diffuseColor.a / max(opacity, 0.0001));\n" +
          "diffuseColor.a *= smoothstep(wristFade.x, wristFade.y, vMapUv.x * wristFade.z);",
      );
  };
  sprite.frustumCulled = false;
  return sprite;
}
