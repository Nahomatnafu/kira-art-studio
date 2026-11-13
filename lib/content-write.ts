import { z } from "zod";
import { artworkSchema, collectionSchema, contentSchema, eventSchema, imageSettingSchema, settingsSchema } from "./content";
import { multiline, phoneNumber, singleLine } from "./input";
import { studioLogo } from "./image-settings";

const id = z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).refine(value => value !== "constructor" && value !== "prototype");
const title = (max: number) => z.string().refine(singleLine).trim().min(1).max(max);
const line = (max: number) => z.string().max(max).refine(singleLine);
const text = (max: number) => z.string().max(max).refine(multiline);
const price = z.number().min(0).max(1_000_000_000).refine(
  amount => Math.abs(Math.round(amount * 100) - amount * 100) < 0.00002,
  "Enter a price with no more than two decimal places",
).nullable();

const httpsUrl = z.string().max(2000).refine(value => {
  if (!value) return true;
  if (!/^https:\/\/[^/]/i.test(value) || /[\\\s\u0000-\u001f\u007f-\u009f]/.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}, "Enter a full HTTPS URL");
const mediaUrl = z.union([httpsUrl, z.literal(studioLogo),
  z.string().max(2000).regex(/^\/(?:images|uploads)\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+(?:\.[a-z0-9_-]+)+$/i),
], "Use a full HTTPS URL or a studio image");
const artwork = artworkSchema.strict().extend({
  id, slug: id, title: title(120), story: text(4000), dimensions: line(100),
  materials: line(200), price, framingPrice: price, image: mediaUrl, category: z.union([id, z.literal("")]),
});
const collection = collectionSchema.strict().extend({ id, title: title(120), description: text(2000), image: mediaUrl });
const event = eventSchema.strict().extend({
  id, title: title(200), time: line(100), location: line(250), description: text(4000), image: mediaUrl, ticketUrl: httpsUrl,
});
const key = z.string().min(1).max(160).regex(/^[a-z0-9]+(?:[-.:][a-z0-9]+)*$/).refine(value => value !== "constructor" && value !== "prototype");
const settings = settingsSchema.strict().extend({
  pageImages: z.record(key, imageSettingSchema.extend({ src: mediaUrl })).refine(value => Object.keys(value).length <= 700),
  artworkPhotos: z.record(id, z.array(mediaUrl).max(30)).refine(value => Object.keys(value).length <= 300),
  homePhotos: z.array(mediaUrl.refine(Boolean)).max(100).refine(value => new Set(value).size === value.length, "This gallery contains duplicate photos."),
  collectionPhotos: z.array(mediaUrl).max(100),
  communityPhotos: z.array(mediaUrl).max(100),
  exhibitionPhotos: z.array(mediaUrl).max(100),
  heroImage: mediaUrl, aboutPortrait: mediaUrl, portrait: mediaUrl, studioImage: mediaUrl, communityImage: mediaUrl, exhibitionVideo: mediaUrl,
  instagram: httpsUrl, tiktok: httpsUrl, facebook: httpsUrl,
  phone: line(40).refine(phoneNumber, "Enter a phone number"), location: line(150),
  testimonials: z.array(z.strictObject({quote: text(2000), name: line(100), context: line(200), approved: z.boolean()})).max(20),
});

// Keep legacy content readable; enforce the stronger rules before anything is saved.
export const contentWriteSchema = contentSchema.strict().safeExtend({
  revision: z.number().int().min(0).max(2_147_483_646),
  artworks: z.array(artwork).max(300), collections: z.array(collection).max(50), events: z.array(event).max(100), settings,
}).superRefine(({ artworks, collections }, ctx) => {
  const collectionIds = new Set(collections.map(item => item.id));
  artworks.forEach((item, index) => {
    if (item.category && !collectionIds.has(item.category)) {
      ctx.addIssue({ code: "custom", path: ["artworks", index, "category"], message: "Choose an existing collection." });
    }
  });
});
