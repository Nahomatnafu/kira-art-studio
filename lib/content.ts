import { z } from "zod";
import { catalogArtworks } from "./catalog";
import { studioCommunityPhotos } from "./media";
export const safeUrl=z.string().max(2000).refine(s=>{
 if(!s)return true;
 if(/[\\\u0000-\u0020\u007f]/.test(s))return false;
 try{const u=new URL(s,'https://kira.invalid');return s.startsWith('/')?(!s.startsWith('//')&&(u.pathname.startsWith('/images/')||u.pathname.startsWith('/uploads/'))&&!u.search&&!u.hash):u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}
},"Use an HTTPS URL or uploaded image");
export const imageSettingSchema=z.object({src:safeUrl,zoom:z.number().min(0.5).max(3),positionX:z.number().min(0).max(100),positionY:z.number().min(0).max(100),fit:z.enum(['contain','cover'])}).strict();
export const artworkSchema = z.object({
  id: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(120),
  story: z.string().max(4000),
  dimensions: z.string().max(100),
  materials: z.string().max(200),
  price: z.number().min(0).nullable(),
  framingPrice: z.number().min(0).nullable(),
  image: safeUrl,
  category: z.string().max(100),
  status: z.enum(["available", "sold", "not-for-sale"]),
  featured: z.boolean(),
  published: z.boolean(),
  placeholder: z.boolean(),
});
export const collectionSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(120),
  description: z.string().max(2000),
  image: safeUrl,
  comingSoon: z.boolean(),
});
export const eventSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  date: z
    .string()
    .refine(
      (v) =>
        /^\d{4}-\d{2}-\d{2}$/.test(v) &&
        !Number.isNaN(Date.parse(v + "T12:00:00Z")) &&
        new Date(v + "T12:00:00Z").toISOString().slice(0, 10) === v,
      "Enter a valid calendar date",
    ),
  time: z.string().max(100),
  location: z.string().max(250),
  description: z.string().max(4000),
  image: safeUrl,
  ticketUrl: safeUrl,
  confirmed: z.boolean(),
  published: z.boolean(),
});
export const settingsSchema = z.object({
  pageImages:z.record(z.string().min(1).max(2100),imageSettingSchema).refine(v=>Object.keys(v).length<=700).default({}),
  homePhotos:z.array(safeUrl.refine(v=>Boolean(v),"Choose an image or remove the empty photo slot.")).max(100).refine(v=>new Set(v).size===v.length,"This gallery contains duplicate photos.").default(studioCommunityPhotos.slice(0,3)),
  collectionPhotos:z.array(safeUrl).max(100).default(studioCommunityPhotos.slice(0,3)),
  artworkPhotos:z.record(z.string().max(100),z.array(safeUrl).max(30)).default({}),
  heroImage: safeUrl.default("/images/artworks/quiet-memory.jpg"),
  aboutPortrait: safeUrl.default("/images/kira-artist-02.jpg"),
  email: z.union([z.literal(""), z.email()]),
  phone: z.string().max(40),
  location: z.string().max(150),
  instagram: safeUrl,
  tiktok: safeUrl,
  facebook: safeUrl,
  portrait: safeUrl,
  studioImage: safeUrl,
  communityImage: safeUrl,
  communityPhotos: z.array(safeUrl).max(100).default(studioCommunityPhotos),
  exhibitionVideo: safeUrl,
  exhibitionPhotos: z.array(safeUrl).max(100),
  testimonials: z
    .array(
      z.object({
        quote: z.string().max(2000),
        name: z.string().max(100),
        context: z.string().max(200),
        approved: z.boolean(),
      }),
    )
    .max(20),
});
export const contentSchema = z
  .object({
    revision: z.number().int().min(0),
    artworks: z.array(artworkSchema).max(300),
    collections: z.array(collectionSchema).max(50),
    events: z.array(eventSchema).max(100),
    settings: settingsSchema,
  })
  .superRefine((data, ctx) => {
    for (const field of ["artworks", "collections", "events"] as const) {
      const ids = data[field].map((x) => x.id);
      if (new Set(ids).size !== ids.length)
        ctx.addIssue({
          code: "custom",
          message: "Duplicate IDs",
          path: [field],
        });
    }
    const slugs = data.artworks.map((x) => x.slug);
    if (new Set(slugs).size !== slugs.length)
      ctx.addIssue({
        code: "custom",
        message: "Artwork slugs must be unique",
        path: ["artworks"],
      });
  });
export type Content = z.infer<typeof contentSchema>;
export type Artwork = z.infer<typeof artworkSchema>;
export const tagline =
  "A Thousand Emotions, A Million Brushstrokes—Where Colors Whisper, Canvases Remember, and Stories Live Forever.";
export const biography = [
  "Art has been part of my life since childhood. I began drawing when I was around eight to ten years old, inspired by the people, animals, and stories I saw in movies, magazines, and newspapers. What started as a childhood curiosity gradually became a lifelong passion for creativity and self-expression.",
  "I am a self-taught visual artist whose work is deeply inspired by Ethiopian, Eritrean, and African culture, history, identity, and everyday life. Through my paintings, I explore the beauty of tradition, the strength of women, the dignity of humanity, and the emotions and memories that connect us.",
  "My artistic journey is driven by curiosity and experimentation. I work with acrylic, oil, mixed media, and digital art, while continuously exploring new materials, textures, and creative techniques. I believe every medium offers a different way to tell a story.",
  "For me, art is more than creating beautiful images. It is a way to preserve memories, celebrate cultural identity, express emotions, and give a voice to stories that deserve to be seen and remembered.",
  "Through Kira Art Studio, my vision is to create meaningful artwork that connects people across cultures and generations, inspires conversations, and reminds us of the beauty and strength within our shared humanity.",
];
export const artistPortrait = "/images/kira-artist.jpg";
export const artistStudioPortrait = "/images/kira-artist-02.jpg";
export const studioContact = {
  email: "Kirubel@kiraartstudio.com",
  phone: "+1 (503) 348-4653",
  instagram: "https://www.instagram.com/kirubel_art/",
  tiktok: "https://www.tiktok.com/@kira.art.studio5",
};
export function getStudioContacts<T extends Pick<Content["settings"],"email"|"phone"|"instagram"|"tiktok">>(settings: T) {
  return {
    ...settings,
    email: settings.email || studioContact.email,
    phone: settings.phone || studioContact.phone,
    instagram: settings.instagram || studioContact.instagram,
    tiktok: settings.tiktok || studioContact.tiktok,
  };
}
export const seed: Content = {
  revision: 0,
  artworks: catalogArtworks,
  collections: [
    {
      id: "original-paintings",
      title: "Original Paintings",
      description:
        "Stories of culture, identity, and everyday beauty, told on canvas.",
      image: "/images/artworks/quiet-majesty.jpg",
      comingSoon: false,
    },
    {
      id: "digital-art",
      title: "Digital Art",
      description: "New expressions, made with a different kind of brush.",
      image: "",
      comingSoon: true,
    },
    {
      id: "3d-prints-crafts",
      title: "3D Prints & Crafts",
      description: "Ideas taking shape beyond the canvas.",
      image: "",
      comingSoon: true,
    },
    {
      id: "textured-art",
      title: "Textured Art",
      description: "Art you can feel. Layers, surfaces, and new perspectives.",
      image: "",
      comingSoon: true,
    },
    {
      id: "apparel",
      title: "Apparel",
      description: "Carry a little art into your everyday.",
      image: "",
      comingSoon: true,
    },
  ],
  events: [
    {
      id: "portland-november-2026",
      title: "Portland Pancake & Brews",
      date: "2026-11-07",
      time: "8–10 p.m.",
      location: "Portland, Oregon · Venue to be confirmed",
      description:
        "An evening of art and connection. Final venue, event details, and ticket information are awaiting confirmation.",
      image: "",
      ticketUrl: "",
      confirmed: false,
      published: true,
    },
  ],
  settings: {
    pageImages:{},
    homePhotos:studioCommunityPhotos.slice(0,3),
    collectionPhotos:studioCommunityPhotos.slice(0,3),
    artworkPhotos:{},
    heroImage: "/images/artworks/quiet-memory.jpg",
    aboutPortrait: artistStudioPortrait,
    email: studioContact.email,
    phone: studioContact.phone,
    location: "Portland, Oregon",
    instagram: studioContact.instagram,
    tiktok: studioContact.tiktok,
    facebook: "",
    portrait: artistPortrait,
    studioImage: artistStudioPortrait,
    communityImage: studioCommunityPhotos[0],
    communityPhotos: studioCommunityPhotos.slice(0,6),
    exhibitionVideo: "",
    exhibitionPhotos: studioCommunityPhotos,
    testimonials: [],
  },
};
export function money(value: number | null) {
  return value === null
    ? "Price on inquiry"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value);
}
