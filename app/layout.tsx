import type { Metadata } from "next";
import { Header, Footer } from "@/components/Shell";
import { readContent } from "@/lib/store";
import { getStudioContacts } from "@/lib/content";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "KIRA Art Studio | Art. Culture. Connection.",
    template: "%s | KIRA Art Studio",
  },
  description:
    "Original paintings inspired by Ethiopian, Eritrean, and African culture. Explore meaningful art, commission a painting, and connect with Kira Art Studio.",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await readContent();
  return (
    <html lang="en">
      <body>
        <Header
          artworks={content.artworks.filter((a) => a.published)}
          instagram={getStudioContacts(content.settings).instagram}
        />
        <main id="main">{children}</main>
        <Footer settings={content.settings} />
      </body>
    </html>
  );
}
