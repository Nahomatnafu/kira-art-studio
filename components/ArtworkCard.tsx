import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Artwork, money } from "@/lib/content";
export default function ArtworkCard({ artwork: a }: { artwork: Artwork }) {
  return (
    <article className="artwork-card">
      <Link
        href={"/artwork/" + a.slug}
        className="artwork-image"
        aria-label={"View " + a.title}
      >
        <img
          src={a.image || "/images/hero-art.webp"}
          alt={
            a.placeholder ? "Temporary concept image for " + a.title : a.title
          }
          loading="lazy"
        />
        <span className="watermark">
          KIRA<span>ART STUDIO</span>
        </span>
        {a.status === "sold" && <span className="sold-badge">Sold</span>}
        {a.placeholder && (
          <span className="placeholder-badge">Placeholder artwork</span>
        )}
      </Link>
      <Link href={"/artwork/" + a.slug} className="artwork-caption">
        <div>
          <h3>{a.title}</h3>
          <p>{a.materials}</p>
          <small>{a.dimensions}</small>
        </div>
        <ArrowUpRight size={19} />
      </Link>
      <span className="artwork-price">
        {a.status === "sold" ? "In a private collection" : money(a.price)}
      </span>
    </article>
  );
}
