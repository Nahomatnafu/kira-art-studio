import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Brush,
  Heart,
  MessageCircle,
  Package,
  Palette,
  Users,
  GraduationCap,
  Sprout,
} from "lucide-react";
import { readContent } from "@/lib/store";
import { tagline } from "@/lib/content";
import ArtworkCard from "@/components/ArtworkCard";
export default async function Home() {
  const c = await readContent();
  return (
    <>
      <section className="hero">
        <img
          className="hero-image"
          src={c.settings.heroImage || "/images/hero-art.webp"}
          alt="Warm ochre concept painting of an East African woman in profile"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <span className="eyebrow light">
            <span className="little-line" /> STORIES TOLD IN COLOR
          </span>
          <h1>
            Art.
            <br />
            Culture.
            <br />
            <em>Connection.</em>
          </h1>
          <p>
            Original paintings inspired by African identity,
            <br className="desktop-break" /> cultural memory, and human
            connection.
          </p>
          <Link className="button button-light" href="/artwork">
            Explore artwork <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="hero-bottom">
          <span>ETHIOPIAN ROOTS. UNIVERSAL STORIES.</span>
          <a href="#featured" aria-label="Scroll to featured artwork">
            DISCOVER THE STUDIO <ArrowDown size={15} />
          </a>
          <span className="hero-placeholder">Concept image · replaceable</span>
        </div>
      </section>
      <section id="featured" className="section">
        <div className="section-top">
          <div>
            <span className="eyebrow">SELECTED WORKS / 01</span>
            <h2>Stories on canvas.</h2>
            <p>
              A collection of original paintings rooted in culture,
              <br className="desktop-break" /> memory, and the beauty of being
              human.
            </p>
          </div>
          <Link className="button button-outline" href="/artwork">
            View full gallery <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="artwork-grid">
          {c.artworks
            .filter((a) => a.published && a.featured)
            .slice(0, 4)
            .map((a) => (
              <ArtworkCard key={a.id} artwork={a} />
            ))}
        </div>
      </section>
      <section className="artist-band">
        <div className="artist-art">
          <img
            src={c.settings.portrait || "/images/women.webp"}
            alt={
              c.settings.portrait
                ? "The artist behind Kira Art Studio"
                : "Temporary artwork, awaiting the artist’s portrait"
            }
            loading="lazy"
          />
          {!c.settings.portrait && (
            <span className="image-note">Artist portrait to follow</span>
          )}
        </div>
        <div className="artist-story">
          <span className="eyebrow">MEET THE ARTIST / 02</span>
          <h2>
            The artist behind
            <br />
            the canvas.
          </h2>
          <p>
            I am a self-taught visual artist inspired by Ethiopian, Eritrean,
            and African culture, history, identity, and everyday life.
          </p>
          <p>
            Through painting, I preserve memories, celebrate our shared
            humanity, and give a voice to stories that deserve to be seen and
            remembered.
          </p>
          <Link href="/about" className="text-link">
            Read my story <ArrowUpRight size={18} />
          </Link>
          <span className="signature">Kira</span>
        </div>
        <div className="pattern-strip" aria-hidden="true" />
      </section>
      <section className="section collections-section">
        <div className="section-top">
          <div>
            <span className="eyebrow">THE COLLECTIONS / 03</span>
            <h2>Many mediums. One story.</h2>
            <p>Different ways to express the things that connect us.</p>
          </div>
          <Link href="/collections" className="text-link">
            Explore collections <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="collection-home-grid">
          {c.collections.map((x, i) => (
            <Link
              href={"/artwork?category=" + x.id}
              className="collection-home"
              key={x.id}
            >
              <div className={"collection-cover cover-" + i}>
                {x.image ? (
                  <img
                    src={x.image}
                    alt={x.title + " concept cover"}
                    loading="lazy"
                  />
                ) : (
                  <span className="collection-symbol" aria-hidden="true">
                    {
                      [
                        null,
                        <Palette key="p" />,
                        <Package key="b" />,
                        <Brush key="r" />,
                        <Sprout key="s" />,
                      ][i % 5]
                    }
                  </span>
                )}
                {x.comingSoon && (
                  <span className="coming-soon">Coming soon</span>
                )}
              </div>
              <h3>
                {x.title}
                <ArrowUpRight size={17} />
              </h3>
              <span>
                {x.comingSoon ? "A new chapter, on its way" : "View collection"}
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="commission-band">
        <div className="commission-visual">
          <img
            src={c.settings.studioImage || "/images/coffee.webp"}
            alt={
              c.settings.studioImage
                ? "Inside the artist’s studio"
                : "Temporary still-life artwork for the studio"
            }
            loading="lazy"
          />
          <span className="image-note">
            {!c.settings.studioImage ? "Studio image to follow" : ""}
          </span>
        </div>
        <div className="commission-copy">
          <span className="eyebrow">MADE JUST FOR YOU / 04</span>
          <h2>
            Your story.
            <br />
            An original painting.
          </h2>
          <p>
            For your home, your space, or someone you love.
            <br />
            Let’s create something meaningful together.
          </p>
          <div className="process-mini">
            {[
              [MessageCircle, "01", "Inquiry"],
              [Users, "02", "Discussion"],
              [Brush, "03", "Creation"],
              [Package, "04", "Delivery"],
            ].map(([Icon, n, label]) => {
              const I = Icon as typeof Brush;
              return (
                <div key={String(n)}>
                  <I size={24} strokeWidth={1.3} />
                  <small>
                    {String(n)} / {String(label)}
                  </small>
                </div>
              );
            })}
          </div>
          <Link href="/commissions" className="button button-dark">
            Commission a painting <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="section events-home">
        <div>
          <span className="eyebrow">BEYOND THE CANVAS / 05</span>
          <h2>Art, out in the world.</h2>
          <p>
            Exhibitions, gatherings, and moments
            <br />
            of connection through art.
          </p>
          <Link href="/exhibitions" className="text-link">
            Exhibitions & events <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="event-preview-list">
          {c.events
            .filter(
              (x) =>
                x.published && x.date >= new Date().toISOString().slice(0, 10),
            )
            .slice(0, 3)
            .map((x) => (
              <Link
                href={"/exhibitions#" + x.id}
                className="event-preview"
                key={x.id}
              >
                <div className="event-date">
                  <span>
                    {new Date(x.date + "T12:00:00").toLocaleDateString(
                      "en-US",
                      { month: "short" },
                    )}
                  </span>
                  <strong>{Number(x.date.slice(-2))}</strong>
                </div>
                <div>
                  <span className="eyebrow">
                    {x.confirmed
                      ? "UPCOMING EXHIBITION"
                      : "DETAILS BEING CONFIRMED"}
                  </span>
                  <h3>{x.title}</h3>
                  <p>
                    {x.location.split(" · ")[0]} · {x.time}
                  </p>
                </div>
                <ArrowUpRight size={21} />
              </Link>
            ))}
        </div>
      </section>
      <section className="community-band">
        <div>
          <span className="eyebrow light">ART BELONGS TO EVERYONE / 06</span>
          <h2>
            A studio. A community.
            <br />
            <em>A world of possibility.</em>
          </h2>
          <p>
            A vision for a welcoming place to create, learn, and celebrate
            culture.
            <br />
            From free youth art activities to shared creative adventures.
          </p>
          <Link href="/community" className="button button-light">
            Discover the vision <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="community-pillars">
          {[
            [Users, "Youth & creativity"],
            [GraduationCap, "Art education"],
            [Heart, "Community connection"],
            [Sprout, "Cultural preservation"],
          ].map(([Icon, label]) => {
            const I = Icon as typeof Heart;
            return (
              <div key={String(label)}>
                <I size={27} strokeWidth={1.2} />
                <span>{String(label)}</span>
              </div>
            );
          })}
        </div>
      </section>
      <section className="closing-quote">
        <span className="eyebrow">THE SPIRIT OF KIRA</span>
        <p>{tagline}</p>
        <Link className="text-link" href="/contact">
          Let’s connect <ArrowUpRight size={18} />
        </Link>
      </section>
    </>
  );
}
