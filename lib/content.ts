import { z } from "zod";
export const safeUrl = z
  .string()
  .max(2000)
  .refine(
    (s) =>
      !s ||
      s.startsWith("/images/") ||
      s.startsWith("/uploads/") ||
      /^https:\/\//.test(s),
    "Use an HTTPS URL or uploaded image",
  );
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
  heroImage: safeUrl.default("/images/hero-art.webp"),
  email: z.union([z.literal(""), z.email()]),
  phone: z.string().max(40),
  location: z.string().max(150),
  instagram: safeUrl,
  tiktok: safeUrl,
  facebook: safeUrl,
  portrait: safeUrl,
  studioImage: safeUrl,
  communityImage: safeUrl,
  exhibitionVideo: safeUrl,
  exhibitionPhotos: z.array(safeUrl).max(20),
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
export const studioContact = {
  email: "Kirubel@kiraartstudio.com",
  phone: "+1 (503) 348-4653",
  instagram: "https://www.instagram.com/kirubel_art/",
  tiktok: "https://www.tiktok.com/@kira.art.studio5",
};
export function getStudioContacts(settings: Content["settings"]) {
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
  artworks: [
    {
      id: "quiet-majesty",
      slug: "quiet-majesty",
      title: "Quiet Majesty",
      story:
        "A reflection on identity, dignity, and the strength carried in stillness. Final artwork story to be supplied by the artist.",
      dimensions: "48 × 36 inches",
      materials: "Oil and acrylic on canvas",
      price: 2500,
      framingPrice: null,
      image: "/images/hero-art.webp",
      category: "original-paintings",
      status: "available",
      featured: true,
      published: true,
      placeholder: true,
    },
    {
      id: "quiet-strength",
      slug: "quiet-strength",
      title: "Quiet Strength",
      story:
        "A celebration of connection and the beauty we carry together. Final artwork story to be supplied by the artist.",
      dimensions: "48 × 24 inches",
      materials: "Acrylic on canvas",
      price: 1500,
      framingPrice: null,
      image: "/images/women.webp",
      category: "original-paintings",
      status: "available",
      featured: true,
      published: true,
      placeholder: true,
    },
    {
      id: "yemengelle-jagnit",
      slug: "yemengelle-jagnit",
      title: "Yemengelle Jagnit",
      story:
        "Culture, ritual, and the small moments that become lasting memories. Final artwork story to be supplied by the artist.",
      dimensions: "14 × 18 inches",
      materials: "Acrylic on canvas",
      price: 300,
      framingPrice: null,
      image: "/images/coffee.webp",
      category: "original-paintings",
      status: "available",
      featured: true,
      published: true,
      placeholder: true,
    },
    {
      id: "echoes-of-memory",
      slug: "echoes-of-memory",
      title: "Echoes of Memory",
      story:
        "An exploration of the everyday places that shape our sense of belonging. Details and launch selection awaiting artist approval.",
      dimensions: "Details coming soon",
      materials: "Details coming soon",
      price: null,
      framingPrice: null,
      image: "/images/city.webp",
      category: "original-paintings",
      status: "not-for-sale",
      featured: true,
      published: true,
      placeholder: true,
    },
    {
      id: "the-beauty-we-carry",
      slug: "the-beauty-we-carry",
      title: "The Beauty We Carry",
      story:
        "A meditation on shared humanity and the stories held across generations. Details and launch selection awaiting artist approval.",
      dimensions: "Details coming soon",
      materials: "Details coming soon",
      price: null,
      framingPrice: null,
      image: "/images/hero-art.webp",
      category: "original-paintings",
      status: "not-for-sale",
      featured: false,
      published: true,
      placeholder: true,
    },
  ],
  collections: [
    {
      id: "original-paintings",
      title: "Original Paintings",
      description:
        "Stories of culture, identity, and everyday beauty, told on canvas.",
      image: "/images/hero-art.webp",
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
    heroImage: "/images/hero-art.webp",
    email: studioContact.email,
    phone: studioContact.phone,
    location: "Portland, Oregon",
    instagram: studioContact.instagram,
    tiktok: studioContact.tiktok,
    facebook: "",
    portrait: artistPortrait,
    studioImage: "",
    communityImage: "",
    exhibitionVideo: "",
    exhibitionPhotos: [],
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
