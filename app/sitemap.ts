import type { MetadataRoute } from "next";
import { readContent } from "@/lib/store";
import { publicSections, siteOrigin } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { artworks } = await readContent();
  return [
    { url: siteOrigin + "/" },
    ...Object.keys(publicSections).map(section => ({ url: siteOrigin + "/" + section })),
    ...artworks.filter(artwork => artwork.published).map(artwork => ({
      url: siteOrigin + "/artwork/" + artwork.slug,
    })),
  ];
}
