import Link from "next/link";
import {
  Brush,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Palette,
  Users,
  GraduationCap,
  Sprout,
} from "lucide-react";
import { readContent } from "@/lib/store";
import { artistPortrait, getStudioContacts, tagline } from "@/lib/content";
import ArtworkCard from "@/components/ArtworkCard";
import SocialLinks from "@/components/SocialLinks";
export default async function Home() {
  const c = await readContent();
  const contact = getStudioContacts(c.settings);
  return (
    <>
      <section className="hero">
        <img
          className="hero-image"
          src={c.settings.heroImage || "/images/hero-art.webp"}
          alt="Painting of an East African woman in profile"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="hero-content">
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
            Explore Artwork
          </Link>
        </div>
      </section>
      <section id="featured" className="section">
        <div className="section-top">
          <div>
            <h2>Featured Artwork</h2>
            <p>
              A collection of original paintings inspired by African identity,
              <br className="desktop-break" /> cultural memory, and human
              connection.
            </p>
          </div>
          <Link className="button button-outline" href="/artwork">
            View Full Gallery
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
            src={c.settings.portrait || artistPortrait}
            alt="Kirubel Mikael, known as Kira, beside his artwork"
            loading="lazy"
          />
        </div>
        <div className="artist-story">
          <h2>About the Artist</h2>
          <p>
            I'm Kirubel Mikael, known as Kira, a visual artist based in
            Portland, Oregon. My work explores African identity, cultural
            memory, and human connection through bold colors, expressive
            figures, and cultural patterns rooted in Ethiopian and East African
            heritage.
          </p>
          <p>
            I create art to celebrate our stories, our people, and our shared
            humanity. Through painting, I aim to build bridges between culture,
            community, and future generations.
          </p>
          <Link href="/about" className="text-link">
            Read Full Story
          </Link>
        </div>
        <div className="pattern-strip" aria-hidden="true" />
      </section>
      <section className="section collections-section">
        <div className="section-top">
          <div>
            <h2>Explore Collections</h2>
            <p>
              Different themes, same story — people, culture, and connection.
            </p>
          </div>
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
                    alt={x.title + " collection cover"}
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
                  <span className="coming-soon">Coming Soon</span>
                )}
              </div>
              <h3>{x.title}</h3>
              <span>View Collection</span>
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
        </div>
        <div className="commission-copy">
          <h2>Commission a Painting</h2>
          <p>
            Looking for a custom piece for your home, office, or community
            space? I create original artwork based on your vision, space, and
            story.
          </p>
          <div className="process-mini">
            {[
              [Mail, "Inquiry", "Send your idea"],
              [MessageCircle, "Discussion", "We plan together"],
              [Brush, "Creation", "Artwork in progress"],
              [Package, "Delivery", "Your custom artwork"],
            ].map(([Icon, label, description]) => {
              const I = Icon as typeof Brush;
              return (
                <div key={String(label)}>
                  <I size={25} strokeWidth={1.5} />
                  <small>{String(label)}</small>
                  <span>{String(description)}</span>
                </div>
              );
            })}
          </div>
          <Link href="/commissions" className="button button-dark">
            Get Started
          </Link>
        </div>
      </section>
      <section className="section events-home">
        <div>
          <h2>Exhibitions &amp; Events</h2>
          <p>
            Recent and upcoming shows, community events,
            <br className="desktop-break" /> and art collaborations.
          </p>
          <Link href="/exhibitions" className="text-link">
            View Details
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
                  {!x.confirmed && (
                    <span className="eyebrow">DETAILS BEING CONFIRMED</span>
                  )}
                  <h3>{x.title}</h3>
                  <p>
                    {x.location.split(" · ")[0]} · {x.time}
                  </p>
                </div>
              </Link>
            ))}
        </div>
      </section>
      <section className="community-band">
        <div>
          <h2>Community &amp; Future Vision</h2>
          <p>
            With a $25,000 goal, I plan to open a free art space for youth and
            families — a place for creativity, mentorship, and cultural
            education.
          </p>
          <Link href="/community" className="button button-light">
            Learn More
          </Link>
        </div>
        <div className="community-pillars">
          {[
            [Users, "Youth Programs"],
            [GraduationCap, "Art Education"],
            [Heart, "Community Events"],
            [Sprout, "Cultural Preservation"],
          ].map(([Icon, label]) => {
            const I = Icon as typeof Heart;
            return (
              <div key={String(label)}>
                <I size={27} strokeWidth={1.5} />
                <span>{String(label)}</span>
              </div>
            );
          })}
        </div>
      </section>
      <section className="home-contact-band">
        <div>
          <h2>Let’s Connect</h2>
          <p>
            For commissions, collaborations, or any questions,
            <br className="desktop-break" /> feel free to reach out.
          </p>
          <a href={"mailto:" + contact.email} className="home-contact-line">
            <Mail size={17} />
            {contact.email}
          </a>
          <a
            href={"tel:" + contact.phone.replace(/[^+\d]/g, "")}
            className="home-contact-line"
          >
            {contact.phone}
          </a>
          <span className="home-contact-line">
            <MapPin size={17} />
            {contact.location}
          </span>
          <SocialLinks instagram={contact.instagram} tiktok={contact.tiktok} />
          <Link href="/contact" className="button button-outline">
            Send a Message
          </Link>
        </div>
        <img
          src={c.settings.studioImage || "/images/coffee.webp"}
          alt="Studio still life"
          loading="lazy"
        />
      </section>
      <section className="closing-quote">
        <p>{tagline}</p>
      </section>
    </>
  );
}
