"use client";
import { useState } from "react";
import { Check, Upload } from "lucide-react";
export default function InquiryForm({
  kind = "contact",
  initialMessage = "",
}: {
  kind?: "contact" | "commission" | "community" | "experience";
  initialMessage?: string;
}) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    const form = e.currentTarget;
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        body: new FormData(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSent(true);
      setStatus(data.message);
      form.reset();
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (sent)
    return (
      <div className="form-success" role="status">
        <Check size={30} />
        <h3>A connection begins here.</h3>
        <p>{status}</p>
        <button
          className="text-link"
          onClick={() => {
            setSent(false);
            setStatus("");
          }}
        >
          Send another message
        </button>
      </div>
    );
  return (
    <form onSubmit={submit} className="inquiry-form">
      <input type="hidden" name="kind" value={kind} />
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="form-grid">
        <label>
          Full name <span>*</span>
          <input
            name="name"
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            placeholder="Your name"
          />
        </label>
        <label>
          Email address <span>*</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>
      </div>
      <label>
        Phone number <small>optional · for text communication</small>
        <input
          name="phone"
          type="tel"
          maxLength={40}
          autoComplete="tel"
          placeholder="Your phone number"
        />
      </label>
      {kind === "commission" && (
        <div className="form-grid">
          <label>
            Preferred size <small>optional</small>
            <input
              name="size"
              maxLength={100}
              placeholder="e.g. 24 × 36 inches"
            />
          </label>
          <label>
            Category <span>*</span>
            <select name="category" required>
              <option value="">Select a medium</option>
              {["Painting", "Digital Art", "T-shirt", "Bag", "3D"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      {kind === "community" && (
        <label>
          I’m interested in
          <select name="category">
            <option>Collaborating with the studio</option>
            <option>Youth art activities</option>
            <option>Paint & Wine</option>
            <option>Hike & Paint</option>
            <option>Adult art gatherings</option>
          </select>
        </label>
      )}
      <label>
        {kind === "experience" ? "Your experience" : "Tell us a little more"}{" "}
        <span>*</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={6000}
          rows={5}
          defaultValue={initialMessage}
          placeholder={
            kind === "commission"
              ? "Your idea, your story, and what you have in mind…"
              : "What would you like to share?"
          }
        />
      </label>
      {kind === "commission" && (
        <label className="upload-label">
          <Upload size={18} /> Inspiration image{" "}
          <small>optional · JPG, PNG, WebP · up to 3 MB</small>
          <input
            type="file"
            name="inspiration"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && f.size > 3 * 1024 * 1024) {
                e.target.value = "";
                setStatus("Please choose an image smaller than 3 MB.");
              }
            }}
          />
        </label>
      )}
      <p className="form-note">
        Your details are used only to respond to this inquiry.
        {kind === "experience"
          ? " Your words will only be published with your approval."
          : ""}
      </p>
      {status && (
        <p className="form-error" role="alert">
          {status}
        </p>
      )}
      <button className="button button-dark" disabled={busy}>
        {busy
          ? "Sending…"
          : kind === "commission"
            ? "Send commission inquiry"
            : kind === "experience"
              ? "Share your experience"
              : "Send message"}
      </button>
    </form>
  );
}
