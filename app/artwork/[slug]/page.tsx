import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { readContent } from "@/lib/store";
import { money } from "@/lib/content";
import ArtworkCard from "@/components/ArtworkCard";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await readContent();
  return {
    title:
      c.artworks.find((a) => a.slug === slug && a.published)?.title ||
      "Artwork not found",
  };
}
export default async function ArtworkDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await readContent();
  const a = c.artworks.find((x) => x.slug === slug && x.published);
  if (!a) notFound();
  return (
    <section className="section artwork-detail-page">
      <Link href="/artwork" className="back-link">
        <ArrowLeft size={16} /> Back to the gallery
      </Link>
      <div className="artwork-detail-grid">
        <div className="detail-image">
          <img
            src={a.image || "/images/hero-art.webp"}
            alt={
              a.placeholder ? "Temporary concept image for " + a.title : a.title
            }
          />
          <span className="watermark">
            KIRA<span>ART STUDIO</span>
          </span>
          {a.placeholder && (
            <span className="placeholder-badge">Placeholder artwork</span>
          )}
        </div>
        <div className="detail-copy">
          <span className="eyebrow">
            {c.collections.find((x) => x.id === a.category)?.title ||
              "ORIGINAL ARTWORK"}
          </span>
          <h1>{a.title}</h1>
          <span className={"availability " + a.status}>
            {a.status === "available" ? (
              <>
                <span />
                Available for inquiry
              </>
            ) : a.status === "sold" ? (
              "Sold · In a private collection"
            ) : (
              "Details to be confirmed"
            )}
          </span>
          <p className="detail-story">{a.story}</p>
          <dl>
            <div>
              <dt>Medium</dt>
              <dd>{a.materials}</dd>
            </div>
            <div>
              <dt>Dimensions</dt>
              <dd>{a.dimensions}</dd>
            </div>
            <div>
              <dt>Original artwork</dt>
              <dd>{money(a.price)}</dd>
            </div>
            <div>
              <dt>Framing</dt>
              <dd>
                {a.framingPrice === null
                  ? "Available · quoted separately"
                  : `Add ${money(a.framingPrice)}`}
              </dd>
            </div>
          </dl>
          {a.status === "sold" ? (
            <Link className="button button-dark" href="/commissions">
              Commission something personal <ArrowUpRight size={18} />
            </Link>
          ) : (
            <Link
              className="button button-dark"
              href={"/contact?artwork=" + encodeURIComponent(a.title)}
            >
              Inquire about this artwork <ArrowUpRight size={18} />
            </Link>
          )}
          <div className="detail-notes">
            <p>
              <Check size={15} /> Original artwork, created with intention.
            </p>
            <p>
              <Check size={15} /> Ask about framing, delivery, and pickup.
            </p>
            <p>
              <Check size={15} /> Prints, T-shirts, and tote options may be
              available.
            </p>
          </div>
          {a.placeholder && (
            <p className="preview-note">
              This image is a temporary concept, not a photograph of the
              artist’s original work. Final images and artwork details will be
              confirmed before launch.
            </p>
          )}
        </div>
      </div>
      <div className="section-top related-heading">
        <div>
          <span className="eyebrow">CONTINUE EXPLORING</span>
          <h2>More stories on canvas.</h2>
        </div>
        <Link href="/artwork" className="text-link">
          View all works <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="artwork-grid related-grid">
        {c.artworks
          .filter((x) => x.id !== a.id && x.published)
          .slice(0, 3)
          .map((x) => (
            <ArtworkCard key={x.id} artwork={x} />
          ))}
      </div>
    </section>
  );
}
