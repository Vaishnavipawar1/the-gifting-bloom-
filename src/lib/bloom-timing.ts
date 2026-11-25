export const timelineEnd = 8;
export const ease = (time: number, start: number, end: number) => {
  const progress = Math.min(1, Math.max(0, (time - start) / (end - start)));
  return progress * progress * (3 - 2 * progress);
};

export const gardenStart = 8.2;
const gardenEntry = 1.64;
export const storyEnd = gardenStart + timelineEnd - gardenEntry;
export const gardenTimeAt = (time: number) => Math.max(0, time - gardenStart + gardenEntry);
