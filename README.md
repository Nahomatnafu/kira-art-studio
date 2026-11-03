# KIRA Art Studio

An eight-page, responsive Next.js website and protected studio dashboard. React, TypeScript, locally hosted Source Sans 3 (medium body weight) and Cormorant Garamond, Neon Postgres, Vercel Blob, and Resend. No Squarespace dependency.

## Run locally

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. Without credentials, the public site serves the sample catalog and `/admin` offers a clearly labeled, in-memory dashboard preview. Preview edits do not publish or survive a reload.

## Connect production services

Set server-only variables in Vercel Settings → Environment Variables, for Preview and Production as appropriate. Redeploy after changing environment values. Never put secrets in `NEXT_PUBLIC_` variables or commit `.env.local`.

1. **Neon**: Create a Postgres project and add the pooled connection string as `DATABASE_URL`. The application creates its content, session, and rate-limit tables automatically on first use. The first request seeds the sample content. Neon Free scales compute to zero when idle and automatically wakes it on a new query, rather than requiring a manual restart. Review [current plan limits](https://neon.com/pricing) before client handoff.
2. **Admin login**: Set a unique `ADMIN_PASSWORD` of at least 16 characters, and a cryptographically random `SESSION_SECRET` of at least 32 characters. Generate a secret with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Access `/admin`. Sessions use signed, HTTP-only, SameSite=Strict cookies, last eight hours, and are revoked server-side at logout or when the password or secret changes. Production cookies require HTTPS. The database is also required for durable rate limiting; production authentication fails closed without it.
3. **Vercel Blob**: Create a **public** Blob store and connect its `BLOB_READ_WRITE_TOKEN` to enable image uploads. Uploads are authenticated, limited to 3 MB, and fully decode JPEG, PNG, and WebP. Animated, corrupt, SVG, and oversized pixel images are rejected. Accepted uploads are resized to at most 3,200 pixels and re-encoded as WebP without original metadata. External HTTPS image URLs also work. Deleted records retain uploaded files so editors do not accidentally remove an asset used elsewhere. Review Blob usage and clean unused files from Vercel when needed.
4. **Resend**: Add `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` (a verified sender), and `CONTACT_TO_EMAIL` (the studio inbox). Contact, commission, community, and experience forms all use the same server endpoint. All public forms accept text only. Multipart requests, attachment fields, and file uploads are rejected. No inquiries are saved in the public content database. The form reports success only after Resend accepts the request; delivery to a recipient inbox is not guaranteed by API acceptance. Forms have a honeypot, origin validation, size limits, server validation, and a database-backed rate limit.

For local admin development only, copy `.env.example` to `.env.local`, set the password and secret, and enable `KIRA_LOCAL_STORE=1`. Local content is saved in ignored `work/content.json`, with uploads under ignored `public/uploads/`. This local adapter is disabled in production and must not be used as Vercel persistence.

## Dashboard

- Add, edit, publish/unpublish, and remove artwork; mark works available, sold, or not for sale.
- Edit stories, prices, framing price, dimensions, materials, image, collection, and homepage feature status.
- Add/edit/remove collections and change Coming Soon status. Move artwork out of a collection before removing it.
- Add/edit/remove exhibitions and events, dates, locations, descriptions, ticket URLs, and confirmation/publication status.
- Use **Pages & images** to select a page and replace every displayed photograph: home hero/artist/commission/contact, About portrait, artworks, collection covers, event images, community hero, page galleries, and matched artwork detail galleries. Replace shared desktop/mobile logos there too.
- Each photo has an immediate preview, Show full image / Fill frame, 50–300% zoom, horizontal and vertical positioning, and reset. Portrait defaults show the complete photo. Changes preserve the source image. Gallery photos can be added or removed, and featured homepage works can be selected. Artwork and collection cover edits are shared wherever that record appears.
- Update contact/social links, exhibition video URL, and approved community quotes in Studio settings.
- Optimistic revision checks prevent silently overwriting another editor's saved changes.

The current dashboard uses one studio administrator password. It is suitable for a single owner or small trusted team; individual accounts, password reset, MFA, per-editor audit trails, and granular roles are not implemented.

## Pages

`/`, `/about`, `/collections`, `/artwork`, `/commissions`, `/exhibitions`, `/community`, `/contact`; artwork details at `/artwork/[slug]`; studio administration at `/admin`.

## Before client launch

- The catalog contains 12 distinct artworks imported from the supplied sheets and painting photos. Confirm availability before client launch; prices and statuses are editable in the dashboard. A Moment of Freedom has no listed price and remains Price on inquiry. See `ARTWORK_IMPORT.md` for the full source mapping and duplicate audit.
- Confirm the November 7, 2026 Portland event's name, time, venue/address, and ticket URL before marking it confirmed. The seed retains the user's supplied event name and displays “Details being confirmed.” Past events move into the past-events section automatically.
- Add approved Seattle testimonials; none were invented. The supplied studio email, phone/text number, Instagram, and TikTok links are populated. Confirm these business details before launch. Instagram and TikTok use linked icons; Facebook is not displayed.
- Confirm inquiry confirmation copy and data handling wording with the client. Test actual Resend delivery with the verified domain.
- Review all pages on desktop/mobile. The sample site intentionally uses `noindex`; change robots metadata in `app/layout.tsx` after final content is approved, and add the real canonical domain and sitemap.
- The watermark is a visual overlay, not image theft protection. Screenshots and direct-image downloads cannot be prevented. Use pre-watermarked derivatives if durable watermarking is needed.
- Vercel's Hobby plan is restricted to personal, non-commercial use. Review the [Vercel plan requirements](https://vercel.com/docs/plans/hobby) for this client studio before launch. No paid plan is purchased by this project.
- Image rights: the live catalog and photo galleries use the client-supplied artwork and photographs. Earlier generated concept files are retained as unused fallback history. See `ASSETS.md` and `ARTWORK_IMPORT.md` for asset notes.

## Validation

```sh
npm run build
npm test
npm audit
```

The smoke test starts an isolated local dev server on port 3187, uses an ephemeral admin password/secret and a separate ignored test data file, checks public pages, auth, origin protection, CRUD, stale-edit conflicts, unsafe URL rejection, draft privacy, uploads, and honest errors when email is not connected. It does not send email or contact production services.

## Deploy

Import the `kira-art-studio` GitHub repo into Vercel, keep framework detection set to Next.js, configure environment variables, and deploy. Every push to the linked branch can create a deployment. This repository is portable and includes a committed lockfile for reproducible installs.

## Branding and reference copy

The supplied horizontal logo is used on desktop; the supplied vertical logo is used at mobile widths and for the favicon. Both originals are preserved without image edits. Public section headings, descriptions, and action labels follow the supplied reference screenshots; decorative numbering and diagonal arrows have been removed. The catalog keeps the five media categories and supplied artwork records from the detailed page brief.

Exhibitions & Events includes 27 unique photographs, an expandable grid, and a keyboard-accessible full-size viewer. Selected previews also appear on Home, Collections, Community, and matching artwork detail pages. Replace or add gallery photographs in Pages & images.

See SECURITY.md for implemented controls and remaining service setup.
