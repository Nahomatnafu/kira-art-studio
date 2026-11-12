"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  Eye,
  ImageIcon,
  Layers,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Palette,
  Plus,
  Search,
  Settings,
  Trash2,
  Upload,
  X,
  CalendarDays,
} from "lucide-react";
import { Content, contentSchema, money } from "@/lib/content";
import ArtworkImage from "./ArtworkImage";
import PageImageManager from "./PageImageManager";
import ImageEditor from "./ImageEditor";
import {defaultFraming,type ImageSetting} from "@/lib/image-settings";
type Tab =
  "Pages & images" | "Logos" | "Overview" | "Artwork" | "Collections" | "Exhibitions" | "Studio settings";
type Item = Record<string, any>;
const tabs: [Tab, typeof Palette][] = [
  ["Overview", LayoutDashboard],
  ["Artwork", Palette],
  ["Pages & images", ImageIcon],
  ["Logos", Palette],
  ["Collections", Layers],
  ["Exhibitions", CalendarDays],
  ["Studio settings", Settings],
];
const artFields = [
  ["title", "Title"],
  ["slug", "Page URL slug"],
  ["story", "Artwork story", "textarea"],
  ["dimensions", "Dimensions"],
  ["materials", "Materials"],
  ["price", "Price in USD", "number"],
  ["framingPrice", "Additional framing price in USD", "number"],
  ["category", "Collection", "collection"],
  ["status", "Availability", "status"],
  ["image", "Artwork image URL", "image"],
  ["placeholder", "Temporary placeholder image", "checkbox"],
  ["featured", "Feature on homepage", "checkbox"],
  ["published", "Publish artwork", "checkbox"],
];
const collectionFields = [
  ["title", "Collection name"],
  ["description", "Description", "textarea"],
  ["image", "Cover image URL", "image"],
  ["comingSoon", "Coming soon", "checkbox"],
];
const eventFields = [
  ["title", "Event title"],
  ["date", "Date", "date"],
  ["time", "Time"],
  ["location", "Location / full venue address"],
  ["description", "Description", "textarea"],
  ["image", "Event image URL", "image"],
  ["ticketUrl", "Ticket / event URL"],
  ["confirmed", "Event details confirmed", "checkbox"],
  ["published", "Publish event", "checkbox"],
];
export default function Admin({
  initialContent,
  authenticated: initialAuth,
  configured,
}: {
  initialContent: Content;
  authenticated: boolean;
  configured: boolean;
}) {
  const [content, setContent] = useState(initialContent);
  const [authenticated, setAuthenticated] = useState(initialAuth);
  const [preview, setPreview] = useState(false);
  const [tab, setTab] = useState<Tab>("Overview");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<{
    kind: "artworks" | "collections" | "events";
    item: Item;
    isNew: boolean;
    framing?:ImageSetting;
  } | null>(null);
  const [settings, setSettings] = useState(content.settings);
  const [deleting, setDeleting] = useState<{
    kind: "artworks" | "collections" | "events";
    id: string;
  } | null>(null);
  const [uploading, setUploading] = useState("");
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!editing && !deleting) return;
    const before = document.activeElement as HTMLElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.querySelector<HTMLElement>("button,input")?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditing(null);
        setDeleting(null);
      }
      if (e.key === "Tab") {
        const nodes = dialog.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled]),input:not([type=hidden]),select,textarea,a[href]",
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", handler);
      before?.focus();
    };
  }, [Boolean(editing), Boolean(deleting)]);
  async function signOut() {
    try {
      if (!preview) {
        const response = await fetch("/api/admin/session", {
          method: "DELETE",
        });
        if (!response.ok)
          throw new Error("Could not sign out. Please try again.");
      }
      setAuthenticated(false);
      setPreview(false);
      setContent(initialContent);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: data.get("password") }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      const cr = await fetch("/api/admin/content");
      const cj = await cr.json();
      if (!cr.ok) throw new Error(cj.error);
      setContent(cj);
      setSettings(cj.settings);
      setAuthenticated(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save(next: Content) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const parsed = contentSchema.safeParse(next);
      if (!parsed.success)
        throw new Error(
          parsed.error.issues
            .map((x) => x.path.join(".") + ": " + x.message)
            .join("; "),
        );
      if (preview) {
        setContent({ ...next, revision: next.revision + 1 });
        setMessage(
          "Preview updated. Connect the database to publish changes to the website.",
        );
        return true;
      }
      const r = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setContent(j);
      setMessage("Saved. Your changes are live on the website.");
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File, key: string, set: (url: string) => void) {
    if (preview) {
      setError(
        "Image uploads need connected storage. You can paste an HTTPS image URL to try the preview.",
      );
      return;
    }
    setUploading(key);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const r = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      set(j.url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading("");
    }
  }
  function add(kind: "artworks" | "collections" | "events") {
    const id = crypto.randomUUID();
    const item =
      kind === "artworks"
        ? {
            id,
            slug: "new-artwork-" + id.slice(0, 6),
            title: "",
            story: "",
            dimensions: "",
            materials: "",
            price: null,
            framingPrice: null,
            image: "",
            category: content.collections[0]?.id || "",
            status: "available",
            featured: false,
            published: false,
            placeholder: false,
          }
        : kind === "collections"
          ? { id, title: "", description: "", image: "", comingSoon: true }
          : {
              id,
              title: "",
              date: new Date().toISOString().slice(0, 10),
              time: "",
              location: "",
              description: "",
              image: "",
              ticketUrl: "",
              confirmed: false,
              published: false,
            };
    setEditing({ kind, item, isNew: true });
  }
  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const list = content[editing.kind] as Item[];
    const next = {
      ...content,
      [editing.kind]: editing.isNew
        ? [...list, editing.item]
        : list.map((x) => (x.id === editing.item.id ? editing.item : x)),
    } as Content;
    const imageKey=(editing.kind==="artworks"?"artwork:":editing.kind==="collections"?"collection:":"event:")+editing.item.id;
    const view=editing.framing||content.settings.pageImages[imageKey];
    if(view)next.settings={...content.settings,pageImages:{...content.settings.pageImages,[imageKey]:{...view,src:editing.item.image}}};
    if (await save(next)) setEditing(null);
  }
  async function deleteItem() {
    if (!deleting) return;
    if (
      deleting.kind === "collections" &&
      content.artworks.some((a) => a.category === deleting.id)
    ) {
      setError(
        "Move the artwork in this collection to another collection before deleting it.",
      );
      setDeleting(null);
      return;
    }
    if (
      await save({
        ...content,
        [deleting.kind]: content[deleting.kind].filter(
          (x) => x.id !== deleting.id,
        ),
      })
    )
      setDeleting(null);
  }
  function changeTab(t: Tab) {
    setTab(t);
    setSearch("");
    setError("");
    setMessage("");
    if (t === "Studio settings") setSettings(structuredClone(content.settings));
  }
  if (!authenticated && !preview)
    return (
      <section className="admin-login-page">
        <div className="admin-login-art">
          <span className="eyebrow light">A SPACE FOR YOUR STORIES</span>
          <h1>
            Behind
            <br />
            the canvas.
          </h1>
          <p>Your studio, at your fingertips.</p>
        </div>
        <div className="admin-login-card">
          <LockKeyhole size={28} strokeWidth={1} />
          <span className="eyebrow">KIRA ART STUDIO</span>
          <h2>Welcome to your studio.</h2>
          <p>
            {configured
              ? "Sign in to manage artwork, collections, and exhibitions."
              : "The dashboard is ready to explore. Secure publishing will be available once the database and admin login are connected."}
          </p>
          {configured ? (
            <form onSubmit={signIn}>
              <label>
                Studio password
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </label>
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
              <button className="button button-dark" disabled={busy}>
                {busy ? "Signing in…" : "Enter the studio"}
              </button>
            </form>
          ) : (
            <>
              <button
                className="button button-dark"
                onClick={() => setPreview(true)}
              >
                Explore dashboard preview
              </button>
              <p className="small-note">
                Setup required: Neon database, secure admin password, session
                secret. Image uploads use Vercel Blob. Contact forms use Resend.
              </p>
            </>
          )}
          <Link href="/" className="text-link">
            Back to the website
          </Link>
        </div>
      </section>
    );
  const works = content.artworks.filter((a) =>
    (a.title + " " + a.materials).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <section className="admin-shell">
      <aside className="admin-sidebar">
        <span className="eyebrow">YOUR CREATIVE SPACE</span>
        <h2>
          Studio
          <br />
          dashboard.
        </h2>
        <nav aria-label="Dashboard">
          {tabs.map(([t, I]) => (
            <button
              key={t}
              onClick={() => changeTab(t)}
              className={tab === t ? "active" : ""}
            >
              <I size={18} />
              {t}
              <ChevronRight size={14} />
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <span className="admin-avatar">K</span>
          <div>
            <strong>Kira Art Studio</strong>
            <small>
              {preview ? "Dashboard preview" : "Studio administrator"}
            </small>
          </div>
          <button
            className="icon-button"
            aria-label="Sign out"
            onClick={signOut}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-topline">
          <span>STUDIO / {tab.toUpperCase()}</span>
          <div className="admin-topline-actions">
            <Link href="/" target="_blank" className="text-link">
              View website
            </Link>
            <button
              className="icon-button mobile-signout"
              aria-label="Sign out of studio"
              onClick={signOut}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
        {preview && (
          <div className="admin-preview-banner">
            <Eye size={17} />
            <span>
              Dashboard preview · Changes stay in this preview. Connect Neon to
              publish.
            </span>
          </div>
        )}
        <div className="admin-heading">
          <div>
            <span className="eyebrow">
              {tab === "Overview"
                ? "A LITTLE SPACE TO CREATE"
                : "YOUR STUDIO, YOUR STORY"}
            </span>
            <h1>
              {tab === "Overview"
                ? "Welcome back, Kira."
                : tab === "Studio settings"
                  ? "The studio details."
                  : tab + "."}
            </h1>
            <p>
              {tab === "Overview"
                ? "A home for your work, and everything that comes next."
                : tab === "Artwork"
                  ? "Every piece has a story. Keep yours up to date."
                  : tab === "Collections"
                    ? "Curate the different chapters of your creative world."
                    : tab === "Exhibitions"
                      ? "Make room for the next moment of connection."
                      : "Help visitors find you and feel connected."}
            </p>
          </div>
          {["Artwork", "Collections", "Exhibitions"].includes(tab) && (
            <button
              className="button button-dark"
              onClick={() =>
                add(
                  tab === "Artwork"
                    ? "artworks"
                    : tab === "Collections"
                      ? "collections"
                      : "events",
                )
              }
            >
              <Plus size={17} />
              {tab === "Artwork"
                ? "Add artwork"
                : tab === "Collections"
                  ? "Add collection"
                  : "Add event"}
            </button>
          )}
        </div>
        <div aria-live="polite">
          {message && (
            <div className="admin-notice success">
              <Check size={17} />
              {message}
            </div>
          )}
          {error && (
            <div className="admin-notice error" role="alert">
              {error}
            </div>
          )}
        </div>
        {tab === "Overview" && (
          <>
            <div className="stat-grid">
              {[
                ["Artworks", content.artworks.length, Palette],
                [
                  "Available",
                  content.artworks.filter((a) => a.status === "available")
                    .length,
                  ImageIcon,
                ],
                [
                  "Sold",
                  content.artworks.filter((a) => a.status === "sold").length,
                  Check,
                ],
                ["Exhibitions", content.events.length, CalendarDays],
              ].map(([label, value, Icon]) => {
                const I = Icon as typeof Palette;
                return (
                  <div key={String(label)}>
                    <I size={20} strokeWidth={1.2} />
                    <strong>{String(value)}</strong>
                    <span>{String(label)}</span>
                  </div>
                );
              })}
            </div>
            <div className="dashboard-overview-grid">
              <div className="admin-panel">
                <div className="panel-heading">
                  <h3>Your artwork</h3>
                  <button
                    className="text-link"
                    onClick={() => changeTab("Artwork")}
                  >
                    Manage all
                  </button>
                </div>
                {content.artworks.slice(0, 4).map((a) => (
                  <button
                    className="overview-art"
                    key={a.id}
                    onClick={() => {
                      changeTab("Artwork");
                      setEditing({
                        kind: "artworks",
                        item: structuredClone(a),
                        isNew: false,
                      });
                    }}
                  >
                    <ArtworkImage
                      src={a.image || "/images/artworks/quiet-memory.jpg"}
                      alt=""
                    />
                    <span>
                      <strong>{a.title}</strong>
                      <small>{a.materials}</small>
                    </span>
                    <span className={"status-pill " + a.status}>
                      {a.status === "available"
                        ? "Available"
                        : a.status === "sold"
                          ? "Sold"
                          : "Not for sale"}
                    </span>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
              <div className="admin-panel studio-note">
                <span className="eyebrow">YOUR NEXT BRUSHSTROKE</span>
                <h3>
                  Let your
                  <br />
                  collection grow.
                </h3>
                <p>
                  Add a new work, share its story, and let someone discover a
                  piece of themselves in it.
                </p>
                <button
                  className="button button-outline"
                  onClick={() => {
                    changeTab("Artwork");
                    add("artworks");
                  }}
                >
                  Add a new artwork <Plus size={16} />
                </button>
                <div className="setup-checks">
                  <span>
                    <Check size={14} /> Artwork, collections & events
                  </span>
                  <span>
                    <Check size={14} /> Availability & pricing controls
                  </span>
                  <span>
                    <Check size={14} /> Images & studio details
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
        {tab === "Artwork" && (
          <div className="admin-panel">
            <div className="panel-toolbar">
              <span>{content.artworks.length} works in your collection</span>
              <div className="search-field">
                <Search size={16} />
                <input
                  placeholder="Find an artwork…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Find artwork"
                />
              </div>
            </div>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Artwork</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Visibility</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {works.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div className="table-art">
                          <ArtworkImage
                            src={a.image || "/images/artworks/quiet-memory.jpg"}
                            alt=""
                          />
                          <span>
                            <strong>{a.title}</strong>
                            <small>{a.dimensions}</small>
                          </span>
                        </div>
                      </td>
                      <td>{money(a.price)}</td>
                      <td>
                        <span className={"status-pill " + a.status}>
                          {a.status === "available"
                            ? "Available"
                            : a.status === "sold"
                              ? "Sold"
                              : "Not for sale"}
                        </span>
                      </td>
                      <td>
                        {a.published ? "Published" : "Draft"}
                        {a.featured && (
                          <small className="featured-label">Featured</small>
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() =>
                              setEditing({
                                kind: "artworks",
                                item: structuredClone(a),
                                isNew: false,
                              })
                            }
                          >
                            Edit
                          </button>
                          <button
                            aria-label={"Delete " + a.title}
                            onClick={() =>
                              setDeleting({ kind: "artworks", id: a.id })
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!works.length && (
              <div className="empty-admin">
                <p>No artworks found.</p>
                <button className="text-link" onClick={() => add("artworks")}>
                  Add your first artwork <Plus size={15} />
                </button>
              </div>
            )}
          </div>
        )}
        {tab === "Collections" && (
          <div className="admin-collection-grid">
            {content.collections.map((x) => (
              <article className="admin-panel" key={x.id}>
                <div className="admin-collection-image">
                  {x.image ? (
                    <ArtworkImage src={x.image} alt={x.title} />
                  ) : (
                    <Layers size={45} strokeWidth={1} />
                  )}
                </div>
                <div className="admin-collection-copy">
                  <span className="eyebrow">
                    {x.comingSoon
                      ? "COMING SOON"
                      : content.artworks.filter((a) => a.category === x.id)
                          .length + " WORKS"}
                  </span>
                  <h3>{x.title}</h3>
                  <p>{x.description}</p>
                  <div className="table-actions">
                    <button
                      onClick={() =>
                        setEditing({
                          kind: "collections",
                          item: structuredClone(x),
                          isNew: false,
                        })
                      }
                    >
                      Edit collection
                    </button>
                    <button
                      aria-label={"Delete " + x.title}
                      onClick={() =>
                        setDeleting({ kind: "collections", id: x.id })
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        {tab === "Exhibitions" && (
          <div className="admin-event-list">
            {content.events.map((x) => (
              <article className="admin-panel admin-event-card" key={x.id}>
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
                    {x.published ? "PUBLISHED" : "DRAFT"} ·{" "}
                    {x.confirmed ? "CONFIRMED" : "DETAILS PENDING"}
                  </span>
                  <h3>{x.title}</h3>
                  <p>
                    {x.date} · {x.time}
                    <br />
                    {x.location}
                  </p>
                </div>
                <div className="table-actions">
                  <button
                    onClick={() =>
                      setEditing({
                        kind: "events",
                        item: structuredClone(x),
                        isNew: false,
                      })
                    }
                  >
                    Edit event
                  </button>
                  <button
                    aria-label={"Delete " + x.title}
                    onClick={() => setDeleting({ kind: "events", id: x.id })}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
            {!content.events.length && (
              <div className="admin-panel empty-admin">
                <h3>Your next event starts here.</h3>
                <p>Add an exhibition, gathering, or community event.</p>
              </div>
            )}
          </div>
        )}
        {(tab === "Pages & images" || tab === "Logos") && <PageImageManager key={tab} logosOnly={tab === "Logos"} content={content} save={save} upload={upload} busy={busy} uploading={uploading} preview={preview}/>}
        {tab === "Studio settings" && (
          <form
            className="admin-settings admin-panel"
            onSubmit={async (e) => {
              e.preventDefault();
              await save({ ...content, settings });
            }}
          >
            <h3>Contact & social links</h3>
            <div className="form-grid">
              {[
                ["email", "Studio email", "email"],
                ["phone", "Text / phone number", "tel"],
                ["location", "Studio location", "text"],
                ["instagram", "Instagram URL", "url"],
                ["tiktok", "TikTok URL", "url"],
                ["facebook", "Facebook URL", "url"],
              ].map(([key, label, type]) => (
                <label key={key}>
                  {label}
                  <input
                    type={type}
                    value={settings[key as keyof typeof settings] as string}
                    onChange={(e) =>
                      setSettings({ ...settings, [key]: e.target.value })
                    }
                  />
                </label>
              ))}
            </div>
            <h3>Exhibition film</h3><label>Exhibition video URL<input value={settings.exhibitionVideo} onChange={e=>setSettings({...settings,exhibitionVideo:e.target.value})}/></label><p>Page photographs and galleries are managed in Pages &amp; images.</p>
            <h3>Voices from the community</h3>
            <p className="small-note">
              Publish only testimonials approved by the person quoted.
            </p>
            {settings.testimonials.map((t, i) => (
              <div key={i} className="testimonial-editor">
                <div className="form-grid">
                  <label>
                    Name
                    <input
                      value={t.name}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          testimonials: settings.testimonials.map((v, j) =>
                            j === i ? { ...v, name: e.target.value } : v,
                          ),
                        })
                      }
                    />
                  </label>
                  <label>
                    Context
                    <input
                      value={t.context}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          testimonials: settings.testimonials.map((v, j) =>
                            j === i ? { ...v, context: e.target.value } : v,
                          ),
                        })
                      }
                    />
                  </label>
                </div>
                <label>
                  Quote
                  <textarea
                    value={t.quote}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        testimonials: settings.testimonials.map((v, j) =>
                          j === i ? { ...v, quote: e.target.value } : v,
                        ),
                      })
                    }
                  />
                </label>
                <div className="section-top">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={t.approved}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          testimonials: settings.testimonials.map((v, j) =>
                            j === i ? { ...v, approved: e.target.checked } : v,
                          ),
                        })
                      }
                    />
                    Approved for publication
                  </label>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Remove testimonial"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        testimonials: settings.testimonials.filter(
                          (_, j) => i !== j,
                        ),
                      })
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="text-link"
              onClick={() =>
                setSettings({
                  ...settings,
                  testimonials: [
                    ...settings.testimonials,
                    { name: "", context: "", quote: "", approved: false },
                  ],
                })
              }
            >
              <Plus size={16} />
              Add approved voice
            </button>
            <div className="settings-save">
              <button className="button button-dark" disabled={busy}>
                {busy ? "Saving…" : "Save studio details"}
                <Check size={17} />
              </button>
            </div>
          </form>
        )}
      </div>
      {editing && (
        <div className="admin-modal-backdrop">
          <div
            ref={dialog}
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="editor-title"
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">CURATE YOUR STUDIO</span>
                <h2 id="editor-title">
                  {editing.isNew ? "Add" : "Edit"}{" "}
                  {editing.kind === "artworks"
                    ? "artwork"
                    : editing.kind === "collections"
                      ? "collection"
                      : "event"}
                  .
                </h2>
              </div>
              <button
                className="icon-button"
                aria-label="Close editor"
                onClick={() => setEditing(null)}
              >
                <X />
              </button>
            </div>
            <form onSubmit={saveEdit}>
              <div className="editor-fields">
                {(editing.kind === "artworks"
                  ? artFields
                  : editing.kind === "collections"
                    ? collectionFields
                    : eventFields
                ).map(([key, label, type]) => (
                  <label
                    key={key}
                    className={type === "checkbox" ? "checkbox-label" : ""}
                  >
                    {type === "checkbox" ? (
                      <>
                        <input
                          type="checkbox"
                          checked={Boolean(editing.item[key])}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              item: {
                                ...editing.item,
                                [key]: e.target.checked,
                              },
                            })
                          }
                        />
                        {label}
                      </>
                    ) : (
                      <>
                        {label}
                        {type === "textarea" ? (
                          <textarea
                            rows={4}
                            value={editing.item[key] || ""}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                item: {
                                  ...editing.item,
                                  [key]: e.target.value,
                                },
                              })
                            }
                          />
                        ) : type === "status" || type === "collection" ? (
                          <select
                            value={editing.item[key]}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                item: {
                                  ...editing.item,
                                  [key]: e.target.value,
                                },
                              })
                            }
                          >
                            {type === "status"
                              ? ["available", "sold", "not-for-sale"].map(
                                  (v) => (
                                    <option value={v} key={v}>
                                      {v === "not-for-sale"
                                        ? "Not for sale"
                                        : v === "available"
                                          ? "Available"
                                          : "Sold"}
                                    </option>
                                  ),
                                )
                              : content.collections.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.title}
                                  </option>
                                ))}
                          </select>
                        ) : (
                          <div
                            className={
                              type === "image" ? "image-input-row" : ""
                            }
                          >
                            <input
                              required={
                                key === "title" ||
                                key === "slug" ||
                                key === "date"
                              }
                              type={
                                type === "number"
                                  ? "number"
                                  : type === "date"
                                    ? "date"
                                    : "text"
                              }
                              min={type === "number" ? 0 : undefined}
                              step={type === "number" ? "0.01" : undefined}
                              value={editing.item[key] ?? ""}
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  item: {
                                    ...editing.item,
                                    [key]:
                                      type === "number"
                                        ? e.target.value === ""
                                          ? null
                                          : Number(e.target.value)
                                        : e.target.value,
                                  },
                                })
                              }
                            />
                            {type === "image" && (
                              <label className="button button-outline upload-button">
                                <Upload size={16} />
                                {uploading === key ? "Uploading…" : "Upload"}
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp"
                                  disabled={Boolean(uploading)}
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f)
                                      upload(f, key, (url) =>
                                        setEditing((v) =>
                                          v
                                            ? {
                                                ...v,
                                                item: {
                                                  ...v.item,
                                                  [key]: url,
                                                  ...(v.kind==="artworks"?{placeholder:false}:{}),
                                                },
                                              }
                                            : null,
                                        ),
                                      );
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </label>
                ))}
              </div>
              {editing.item.image && <ImageEditor label="Selected image" value={editing.framing||{...defaultFraming,...content.settings.pageImages[(editing.kind==="artworks"?"artwork:":editing.kind==="collections"?"collection:":"event:")+editing.item.id],src:editing.item.image}} onChange={value=>setEditing({...editing,framing:value,item:{...editing.item,image:value.src}})} upload={(file,set)=>upload(file,"editor-image",set)} uploading={Boolean(uploading)} aspect={editing.kind==="artworks"?.75:1.5}/>}
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
              <div className="modal-footer">
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
                <button
                  className="button button-dark"
                  disabled={busy || Boolean(uploading)}
                >
                  {busy ? (
                    <LoaderCircle className="spin" size={17} />
                  ) : (
                    <Check size={17} />
                  )}
                  Save {preview ? "preview" : "changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleting && (
        <div className="admin-modal-backdrop">
          <div
            ref={dialog}
            className="admin-modal delete-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <Trash2 size={27} />
            <h2 id="delete-title">Remove this from the studio?</h2>
            <p>
              This removes the item from the website. Cancel to keep it.
              Uploaded image files are retained in storage.
            </p>
            <div className="modal-footer">
              <button
                className="button button-outline"
                onClick={() => setDeleting(null)}
              >
                Keep it
              </button>
              <button
                className="button button-dark"
                disabled={busy}
                onClick={deleteItem}
              >
                Remove item
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
