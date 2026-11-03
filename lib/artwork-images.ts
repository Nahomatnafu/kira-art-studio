export type ArtworkCrop = {
  sourceWidth: number;
  sourceHeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
};
export const artworkCrops: Record<string, ArtworkCrop> = {
  "/images/artworks/looking-beyond.jpg": {
    sourceWidth: 1015,
    sourceHeight: 1280,
    x: 163,
    y: 28,
    width: 688,
    height: 770,
  },
};
