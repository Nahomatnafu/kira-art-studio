import {ImageSettingsProvider} from "@/components/ImageSettingsProvider";
import type { Metadata } from "next";
import { Header, Footer } from "@/components/Shell";
import { readContent } from "@/lib/store";
import { getStudioContacts } from "@/lib/content";
import { siteOrigin } from "@/lib/site";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "KIRA Art Studio | Art. Culture. Connection.",
    template: "%s | KIRA Art Studio",
  },
  description:
    "Original paintings inspired by Ethiopian, Eritrean, and African culture. Explore meaningful art, commission a painting, and connect with Kira Art Studio.",
  metadataBase: new URL(siteOrigin),
  robots: process.env.VERCEL_ENV === "preview" ? { index: false, follow: false } : undefined,
};
export const dynamic = "force-dynamic";
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await readContent();
  const publicImages=Object.fromEntries(Object.entries(content.settings.pageImages).filter(([key])=>{
    if(key.startsWith("artwork:"))return content.artworks.some(a=>a.published&&key==="artwork:"+a.id);
    if(key.startsWith("artwork-gallery:"))return content.artworks.some(a=>a.published&&key.startsWith("artwork-gallery:"+a.id+".photo."));
    if(key.startsWith("event:"))return content.events.some(e=>e.published&&key==="event:"+e.id);
    return /^(home\.|about\.|commissions\.|community\.|collections\.|exhibitions\.|collection:|brand\.)/.test(key);
  }));
  const {email,phone,instagram,tiktok,location}=content.settings;
  return (
    <html lang="en">
      <body>
        <ImageSettingsProvider images={publicImages}>
        <Header
          artworks={content.artworks.filter((a) => a.published)}
          instagram={getStudioContacts(content.settings).instagram}
        />
        <main id="main">{children}</main>
        <Footer settings={{email,phone,instagram,tiktok,location}} />
        </ImageSettingsProvider>
      </body>
    </html>
  );
}
