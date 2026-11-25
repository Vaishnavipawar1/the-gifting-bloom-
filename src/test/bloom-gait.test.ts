import { describe, expect, it } from "vitest";
import { closingFeet, walkingFeet } from "@/lib/bloom-gait";

describe("illustrated walk cycle", () => {
  it("keeps the supporting foot planted when the body advances", () => {
    for (const direction of [1, -1]) {
      const position = (progress: number) =>
        progress * 3 * direction + walkingFeet(progress, 3, 6, direction)[0]!.x;
      expect(position(0.41)).toBeCloseTo(position(0.48));
      expect(walkingFeet(0.41, 3, 6, direction)[0]!.lift).toBe(0);
      expect(walkingFeet(0.41, 3, 6, direction)[1]!.lift).toBeGreaterThan(0);
    }
  });

  it("settles both feet on the ground after walking and stepping in", () => {
    const result = [...walkingFeet(1, 3, 6, 1), ...closingFeet(1, 0.46, 1)];
    for (const { x, lift } of result) {
      expect(x).toBeCloseTo(0);
      expect(lift).toBeCloseTo(0);
    }
  });

  it("rolls from heel strike to toe-off in both walking directions", () => {
    for (const direction of [1, -1]) {
      const heel = walkingFeet(0.35, 3, 6, direction)[0]!;
      const toe = walkingFeet(0.525, 3, 6, direction)[0]!;
      expect(heel.pitch * direction).toBeGreaterThan(0);
      expect(toe.pitch * direction).toBeLessThan(0);
      expect(heel.lift).toBe(0);
      expect(toe.lift).toBe(0);
    }
  });
});
