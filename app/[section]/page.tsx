import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
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
import { biography, tagline } from "@/lib/content";
import Gallery from "@/components/Gallery";
import InquiryForm from "@/components/InquiryForm";
const titles: Record<string, string> = {
  about: "About the Artist",
  collections: "Explore Collections",
  artwork: "The Gallery",
  commissions: "Commission a Painting",
  exhibitions: "Exhibitions & Events",
  community: "Community & Future Vision",
  contact: "Let’s Connect",
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
      <span className="eyebrow">{eyebrow}</span>
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
  const query = await searchParams;
  if (section === "about")
    return (
      <>
        <section className="section about-page">
          <PageHeading
            eyebrow="THE STORY BEHIND THE STUDIO"
            title={
              <>
                The artist behind
                <br />
                <em>the canvas.</em>
              </>
            }
          >
            Rooted in culture. Guided by curiosity. Connected by humanity.
          </PageHeading>
          <div className="about-grid">
            <div className="about-portrait">
              {c.settings.portrait ? (
                <img
                  src={c.settings.portrait}
                  alt="The artist behind Kira Art Studio"
                />
              ) : (
                <div className="portrait-placeholder">
                  <Brush size={55} strokeWidth={0.75} />
                  <span className="eyebrow">
                    A FACE BEHIND EVERY BRUSHSTROKE
                  </span>
                  <h2>Meet Kira.</h2>
                  <p>Artist portrait coming soon</p>
                  <div className="pattern-strip" />
                </div>
              )}
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
            Explore my work <ArrowUpRight size={18} />
          </Link>
        </section>
      </>
    );
  if (section === "artwork")
    return (
      <section className="section gallery-page">
        <PageHeading
          eyebrow="THE GALLERY"
          title={
            <>
              Every canvas,
              <br />
              <em>a conversation.</em>
            </>
          }
        >
          Original work exploring cultural identity, memory, and human
          connection.
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
            Have something in mind? <ArrowUpRight size={16} />
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
        <PageHeading
          eyebrow="EXPLORE COLLECTIONS"
          title={
            <>
              Many ways to create.
              <br />
              <em>One human story.</em>
            </>
          }
        >
          From the canvas to everyday life. Discover the evolving world of Kira
          Art Studio.
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
                <span className="collection-number">0{i + 1}</span>
              </div>
              <div className="collection-large-copy">
                <span className="eyebrow">
                  {x.comingSoon ? "COMING SOON" : "THE ORIGINALS"}
                </span>
                <h2>
                  {x.title}
                  <ArrowUpRight size={25} />
                </h2>
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
          <PageHeading
            eyebrow="A PERSONAL COLLABORATION"
            title={
              <>
                Your story.
                <br />
                <em>My brushstrokes.</em>
              </>
            }
          >
            An original work of art, created around your vision, your space, and
            what matters to you.
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
              <h2>
                Let’s make something
                <br />
                that feels like you.
              </h2>
              <p>
                Whether you’re imagining a painting for your home, a meaningful
                gift, or an artwork for a shared space, the process begins with
                a conversation.
              </p>
              <p>
                We’ll talk about your ideas, preferred medium, size, and
                timeline. Each piece is a collaboration, with room for the
                unexpected beauty of making art.
              </p>
              <a href="#commission-form" className="text-link">
                Tell me your idea <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
          <div className="process-full">
            {[
              [
                MessageCircle,
                "01",
                "Share your idea",
                "Tell me about your vision, inspiration, and the story you want to tell.",
              ],
              [
                Users,
                "02",
                "Discuss & plan",
                "We’ll explore size, medium, timing, and a personalized quote.",
              ],
              [
                Brush,
                "03",
                "Watch it take shape",
                "Your original artwork comes to life, with progress shared along the way.",
              ],
              [
                Package,
                "04",
                "Welcome it home",
                "Arrange delivery or pickup and discuss framing options.",
              ],
            ].map(([Icon, n, title, body]) => {
              const I = Icon as typeof Brush;
              return (
                <div key={String(n)}>
                  <div className="process-number">
                    <I size={28} strokeWidth={1.2} />
                    <span>{String(n)}</span>
                  </div>
                  <h3>{String(title)}</h3>
                  <p>{String(body)}</p>
                </div>
              );
            })}
          </div>
          <div id="commission-form" className="form-section">
            <div>
              <span className="eyebrow">THE FIRST BRUSHSTROKE</span>
              <h2>
                What do you
                <br />
                <em>have in mind?</em>
              </h2>
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
        <PageHeading
          eyebrow="ART IN GOOD COMPANY"
          title={
            <>
              Beyond
              <br />
              <em>the canvas.</em>
            </>
          }
        >
          Exhibitions, community events, and moments that bring us together.
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
                <span className="eyebrow">FROM THE EXHIBITION FLOOR</span>
                <h3>A closer look, coming soon.</h3>
                <p>Video upload soon</p>
              </>
            )}
          </div>
          <div>
            <span className="eyebrow">UPCOMING EVENTS</span>
            <h2>
              Meet the work.
              <br />
              Share the moment.
            </h2>
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
                      Event details & tickets <ArrowUpRight size={16} />
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
            <span className="eyebrow">MOMENTS TO REMEMBER</span>
            <h2>Previous exhibitions.</h2>
            <p>
              From Seattle and beyond. A growing archive of art and connection.
            </p>
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
                  <span>0{i}</span>
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
          <span className="eyebrow light">THE FUTURE WE IMAGINE</span>
          <h1>
            Art has a way
            <br />
            of bringing us
            <br />
            <em>together.</em>
          </h1>
          <p>
            A vision for a creative space where everyone belongs.
            <br />A place for stories, culture, learning, and possibility.
          </p>
          <span className="community-giant" aria-hidden="true">
            ✺
          </span>
        </section>
        <section className="section">
          <div className="community-intro">
            <span className="eyebrow">A GROWING VISION</span>
            <h2>
              Creativity should
              <br />
              have an open door.
            </h2>
            <p>
              Through Kira Art Studio, I hope to create free art activities for
              young people—a welcoming place to explore ideas, express
              themselves, and connect with cultural stories. This is a vision we
              are building toward, one conversation at a time.
            </p>
          </div>
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
      <PageHeading
        eyebrow="A CONVERSATION STARTS HERE"
        title={
          <>
            Let’s make
            <br />
            <em>a connection.</em>
          </>
        }
      >
        For artwork inquiries, commissions, collaborations, or simply to say
        hello.
      </PageHeading>
      <div className="contact-grid">
        <div className="contact-info">
          <h2>
            Good stories begin
            <br />
            with a hello.
          </h2>
          <p>
            Have a question or an idea? I’d love to hear it.
            <br />
            Email and text are the best ways to reach the studio.
          </p>
          <div className="contact-details">
            {c.settings.email ? (
              <a href={"mailto:" + c.settings.email}>
                <Mail size={20} />
                <span>
                  <small>EMAIL</small>
                  {c.settings.email}
                </span>
                <ArrowUpRight size={17} />
              </a>
            ) : (
              <div>
                <Mail size={20} />
                <span>
                  <small>EMAIL</small>Studio email coming soon
                </span>
              </div>
            )}
            {c.settings.phone ? (
              <a href={"sms:" + c.settings.phone.replace(/[^+\d]/g, "")}>
                <Smartphone size={20} />
                <span>
                  <small>TEXT THE STUDIO</small>
                  {c.settings.phone}
                </span>
                <ArrowUpRight size={17} />
              </a>
            ) : (
              <div>
                <Smartphone size={20} />
                <span>
                  <small>TEXT</small>Studio number coming soon
                </span>
              </div>
            )}
            <div>
              <MapPin size={20} />
              <span>
                <small>BASED IN</small>
                {c.settings.location}
              </span>
            </div>
          </div>
          <div className="contact-socials">
            {c.settings.instagram && (
              <a href={c.settings.instagram} target="_blank" rel="noreferrer">
                Instagram ↗
              </a>
            )}
            {c.settings.tiktok && (
              <a href={c.settings.tiktok} target="_blank" rel="noreferrer">
                TikTok ↗
              </a>
            )}
            {c.settings.facebook ? (
              <a href={c.settings.facebook} target="_blank" rel="noreferrer">
                Facebook ↗
              </a>
            ) : (
              <span>Facebook · coming soon</span>
            )}
          </div>
        </div>
        <InquiryForm key={initial} initialMessage={initial} />
      </div>
      <div className="voices-section">
        <span className="eyebrow">VOICES FROM THE COMMUNITY</span>
        <h2>Art stays with us.</h2>
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
            <p>There’s a story on both sides of the canvas.</p>
            <small>
              Approved voices from our Seattle exhibition will be shared here
              soon.
            </small>
          </div>
        )}
        <details className="experience-form">
          <summary>
            Share your experience <ArrowUpRight size={18} />
          </summary>
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
