import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Brush,
  Check,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Palette,
  Play,
  Smartphone,
  Sprout,
  Users,
} from "lucide-react";
import { readContent } from "@/lib/store";
import { artistPortrait, biography, tagline } from "@/lib/content";
import Gallery from "@/components/Gallery";
import InquiryForm from "@/components/InquiryForm";
import SocialLinks from "@/components/SocialLinks";
import { getStudioContacts } from "@/lib/content";
const titles: Record<string, string> = {
  about: "About the Artist",
  collections: "Explore Collections",
  artwork: "The Gallery",
  commissions: "Commission a Painting",
  exhibitions: "Exhibitions & Events",
  community: "Community & Future Vision",
  contact: "Let’s Create Something",
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return { title: titles[section] || "Page not found" };
}
function PageHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { section } = await params;
  if (!titles[section]) notFound();
  const c = await readContent();
  const contact = getStudioContacts(c.settings);
  const query = await searchParams;
  if (section === "about")
    return (
      <>
        <section className="section about-page">
          <PageHeading eyebrow="" title="The Artist Behind the Canvas" />
          <div className="about-grid">
            <div className="about-portrait">
              <img
                src={c.settings.portrait || artistPortrait}
                alt="Kirubel Mikael, known as Kira, beside his artwork"
                width={1080}
                height={836}
              />
              <div className="about-caption">
                <span>SELF-TAUGHT VISUAL ARTIST</span>
                <span>{c.settings.location}</span>
              </div>
            </div>
            <div className="biography">
              <span className="eyebrow">ARTIST’S STORY</span>
              {biography.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <span className="signature">Kira</span>
            </div>
          </div>
        </section>
        <div className="medium-strip">
          {[
            "Acrylic",
            "Oil",
            "Mixed Media",
            "Digital Art",
            "Texture & Experimentation",
          ].map((x) => (
            <span key={x}>
              {x}
              <span>✦</span>
            </span>
          ))}
        </div>
        <section className="closing-quote">
          <span className="eyebrow">WHY I CREATE</span>
          <p>{tagline}</p>
          <Link className="text-link" href="/artwork">
            Explore my work
          </Link>
        </section>
      </>
    );
  if (section === "artwork")
    return (
      <section className="section gallery-page">
        <PageHeading eyebrow="" title="Featured Artwork">
          A collection of original paintings inspired by African identity,
          cultural memory, and human connection.
        </PageHeading>
        <Gallery
          content={{
            artworks: c.artworks.filter((a) => a.published),
            collections: c.collections,
          }}
          category={typeof query.category === "string" ? query.category : ""}
          query={typeof query.q === "string" ? query.q : ""}
        />
        <div className="gallery-footnote">
          <p>
            Framing is available at an additional cost. Ask about prints,
            T-shirts, and tote bags inspired by selected works.
          </p>
          <Link className="text-link" href="/commissions">
            Have something in mind?
          </Link>
        </div>
        <p className="preview-note">
          Preview collection: images are temporary concepts. Final artwork,
          stories, and five-work selection will be confirmed with the artist.
        </p>
      </section>
    );
  if (section === "collections")
    return (
      <section className="section">
        <PageHeading eyebrow="" title="Explore Collections">
          Different themes, same story — people, culture, and connection.
        </PageHeading>
        <div className="collection-page-grid">
          {c.collections.map((x, i) => (
            <Link
              href={"/artwork?category=" + x.id}
              key={x.id}
              className={"collection-large cover-" + i}
            >
              <div className="collection-large-image">
                {x.image ? (
                  <img
                    src={x.image}
                    alt={"Temporary concept cover for " + x.title}
                  />
                ) : (
                  <Palette size={80} strokeWidth={0.7} />
                )}
              </div>
              <div className="collection-large-copy">
                <span className="eyebrow">
                  {x.comingSoon ? "COMING SOON" : "THE ORIGINALS"}
                </span>
                <h2>{x.title}</h2>
                <p>{x.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  if (section === "commissions")
    return (
      <>
        <section className="section commission-page">
          <PageHeading eyebrow="" title="Commission a Painting">
            Looking for a custom piece for your home, office, or community
            space? I create original artwork based on your vision, space, and
            story.
          </PageHeading>
          <div className="commission-intro">
            <img
              src={c.settings.studioImage || "/images/coffee.webp"}
              alt={
                c.settings.studioImage
                  ? "The artist’s studio"
                  : "Temporary concept artwork for the commission page"
              }
            />
            <div>
              <h2>The Commission Process</h2>
              <p>
                Inquiry, discussion and quote, creation, and delivery or pickup.
              </p>
              <a href="#commission-form" className="text-link">
                Get Started
              </a>
            </div>
          </div>
          <div className="process-full">
            {[
              [MessageCircle, "01", "Inquiry", "Send your idea"],
              [Users, "02", "Discussion", "We plan together"],
              [Brush, "03", "Creation", "Artwork in progress"],
              [Package, "04", "Delivery", "Your custom artwork"],
            ].map(([Icon, n, title, body]) => {
              const I = Icon as typeof Brush;
              return (
                <div key={String(n)}>
                  <div className="process-number">
                    <I size={28} strokeWidth={1.2} />
                  </div>
                  <h3>{String(title)}</h3>
                  <p>{String(body)}</p>
                </div>
              );
            })}
          </div>
          <div id="commission-form" className="form-section">
            <div>
              <h2>Get Started</h2>
              <p>
                A few details are all we need to begin.
                <br />
                Email and text are our preferred ways to keep in touch.
              </p>
              <p className="small-note">
                Submitting an inquiry starts a conversation. A project begins
                once we agree on the details and quote.
              </p>
            </div>
            <InquiryForm kind="commission" />
          </div>
        </section>
      </>
    );
  if (section === "exhibitions")
    return (
      <section className="section exhibitions-page">
        <PageHeading eyebrow="" title="Exhibitions &amp; Events">
          Recent and upcoming shows, community events, and art collaborations.
        </PageHeading>
        <div className="exhibition-feature">
          <div className="video-placeholder">
            {c.settings.exhibitionVideo ? (
              <video
                controls
                preload="metadata"
                src={c.settings.exhibitionVideo}
                aria-label="Exhibition film"
              />
            ) : (
              <>
                <Play size={45} strokeWidth={1} />
                <h3>Upload Soon</h3>
              </>
            )}
          </div>
          <div>
            <h2>Upcoming Events</h2>
            {c.events
              .filter(
                (e) =>
                  e.published &&
                  e.date >= new Date().toISOString().slice(0, 10),
              )
              .map((e) => (
                <article id={e.id} key={e.id} className="event-detail">
                  <span className="event-full-date">
                    {new Date(e.date + "T12:00:00").toLocaleDateString(
                      "en-US",
                      { month: "long", day: "numeric", year: "numeric" },
                    )}{" "}
                    · {e.time}
                  </span>
                  <h3>{e.title}</h3>
                  <p>
                    <MapPin size={15} />
                    {e.location}
                  </p>
                  <p>{e.description}</p>
                  {!e.confirmed && (
                    <span className="pending-tag">Details being confirmed</span>
                  )}
                  {e.confirmed && e.ticketUrl && (
                    <a
                      className="button button-outline"
                      href={e.ticketUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Event details & tickets
                    </a>
                  )}
                </article>
              ))}
            {!c.events.some(
              (e) =>
                e.published && e.date >= new Date().toISOString().slice(0, 10),
            ) && (
              <p>New exhibition dates will be shared here. Check back soon.</p>
            )}
          </div>
        </div>
        <div className="section-top previous-heading">
          <div>
            <h2>Previous Exhibitions</h2>
          </div>
        </div>
        <div className="previous-gallery">
          {c.settings.exhibitionPhotos.length
            ? c.settings.exhibitionPhotos.map((p, i) => (
                <img
                  key={p}
                  src={p}
                  alt={"Previous exhibition photograph " + (i + 1)}
                  loading="lazy"
                />
              ))
            : [1, 2, 3].map((i) => (
                <div key={i} className="photo-placeholder">
                  <h3>Seattle exhibition</h3>
                  <p>Photos upload soon</p>
                </div>
              ))}
        </div>
        {c.events.some(
          (e) => e.published && e.date < new Date().toISOString().slice(0, 10),
        ) && (
          <div className="past-events">
            <h2>Past events</h2>
            {c.events
              .filter(
                (e) =>
                  e.published && e.date < new Date().toISOString().slice(0, 10),
              )
              .map((e) => (
                <article key={e.id}>
                  <h3>{e.title}</h3>
                  <p>
                    {e.date} · {e.location}
                  </p>
                  <p>{e.description}</p>
                </article>
              ))}
          </div>
        )}
      </section>
    );
  if (section === "community")
    return (
      <>
        <section className="community-page-hero">
          {c.settings.communityImage && (
            <img
              className="community-hero-image"
              src={c.settings.communityImage}
              alt="The Kira art community"
            />
          )}
          <h1>Community &amp; Future Vision</h1>
          <p>
            With a $25,000 goal, I plan to open a free art space for youth and
            families — a place for creativity, mentorship, and cultural
            education.
          </p>
          <span className="community-giant" aria-hidden="true">
            ✺
          </span>
        </section>
        <section className="section">
          <div className="vision-grid">
            {[
              [
                GraduationCap,
                "Youth art activities",
                "Free opportunities for young people to learn, experiment, and discover their creative voice.",
              ],
              [
                Palette,
                "Paint & Wine",
                "Relaxed adult art get-togethers, with painting, conversation, and good company.",
              ],
              [
                Sprout,
                "Hike & Paint",
                "Taking creativity outdoors to find inspiration in nature and the world around us.",
              ],
              [
                Heart,
                "Creative community",
                "Collaborations that bring artists, families, and neighbors together through shared stories.",
              ],
            ].map(([Icon, title, body]) => {
              const I = Icon as typeof Heart;
              return (
                <article key={String(title)}>
                  <I size={34} strokeWidth={1} />
                  <span className="eyebrow">PLANNED ACTIVITY</span>
                  <h3>{String(title)}</h3>
                  <p>{String(body)}</p>
                </article>
              );
            })}
          </div>
          <p className="preview-note">
            These are future plans, with dates and locations to come. Scheduled
            events will appear on the Exhibitions & Events page.
          </p>
          <div className="form-section">
            <div>
              <span className="eyebrow">LET’S BUILD IT TOGETHER</span>
              <h2>
                Bring your ideas.
                <br />
                <em>Find your people.</em>
              </h2>
              <p>
                Artists, educators, community members, and curious minds are
                welcome. Tell us how you’d like to be involved.
              </p>
            </div>
            <InquiryForm kind="community" />
          </div>
        </section>
      </>
    );
  const initial =
    typeof query.artwork === "string"
      ? `I’m interested in ${query.artwork}. Please tell me more about availability and options.`
      : "";
  return (
    <section className="section contact-page">
      <PageHeading eyebrow="CONTACT ME" title="Let’s Create Something">
        For original artwork, commissions, collaborations, and orders.
      </PageHeading>
      <div className="contact-grid">
        <div className="contact-info">
          <h2>Let’s Connect</h2>
          <p>
            For commissions, collaborations, or any questions, feel free to
            reach out.
          </p>
          <div className="contact-details">
            <a href={"mailto:" + contact.email}>
              <Mail size={20} />
              <span>
                <small>EMAIL</small>
                {contact.email}
              </span>
            </a>
            <div className="phone-contact">
              <Smartphone size={20} />
              <span>
                <small>PHONE / TEXT</small>
                <a href={"tel:" + contact.phone.replace(/[^+\d]/g, "")}>
                  {contact.phone}
                </a>
              </span>
              <a
                className="text-message-link"
                href={"sms:" + contact.phone.replace(/[^+\d]/g, "")}
                aria-label="Send a text message to Kira Art Studio"
              >
                Text
              </a>
            </div>
            <div>
              <MapPin size={20} />
              <span>
                <small>BASED IN</small>
                {contact.location}
              </span>
            </div>
          </div>
          <SocialLinks
            className="contact-socials"
            instagram={contact.instagram}
            tiktok={contact.tiktok}
          />
        </div>
        <InquiryForm key={initial} initialMessage={initial} />
      </div>
      <div className="voices-section">
        <h2>Voices from the Community</h2>
        {c.settings.testimonials.some((t) => t.approved) ? (
          <div className="testimonial-grid">
            {c.settings.testimonials
              .filter((t) => t.approved)
              .map((t, i) => (
                <blockquote key={i}>
                  <span>“</span>
                  <p>{t.quote}</p>
                  <cite>
                    {t.name}
                    <small>{t.context}</small>
                  </cite>
                </blockquote>
              ))}
          </div>
        ) : (
          <div className="voices-placeholder">
            <span>“</span>

            <small>
              Approved voices from our Seattle exhibition will be shared here
              soon.
            </small>
          </div>
        )}
        <details className="experience-form">
          <summary>Share your experience</summary>
          <div>
            <p>
              Have you spent time with the artwork or joined an exhibition? We’d
              love to hear what stayed with you.
            </p>
            <InquiryForm kind="experience" />
          </div>
        </details>
      </div>
    </section>
  );
}
