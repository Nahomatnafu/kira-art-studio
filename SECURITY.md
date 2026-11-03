# Security implementation

The studio login link is removed from the public footer. Security does not depend on hiding /admin: every content read/write and upload endpoint checks authentication server-side. The dashboard demo only changes browser memory and cannot publish.

## Implemented controls

- A unique password (minimum 16 characters) and session secret (minimum 32 characters) must be configured server-side. Constant-time password comparison; generic login failure; per-IP and global login throttling.
- Eight-hour signed sessions use random identifiers, server-side hashed session records, HttpOnly/SameSite=Strict cookies, and HTTPS-only __Host- cookies in production. Logout revokes the server record, so an old cookie cannot be replayed. Credential rotation invalidates existing signatures.
- Same-origin checks and cross-site Fetch Metadata checks on all mutations. Authentication and content APIs are not cached.
- PostgreSQL-backed limits work across server instances. Production login, publishing, uploads, and mail fail closed when required services are absent. In-memory adapters are limited to local development.
- Request bodies are capped while streamed, independently of Content-Length. JSON parsing is bounded; input is validated on the server; image view values have explicit ranges. SQL uses parameterized queries.
- All visitor forms are text-only JSON: no file inputs, attachments, multipart payloads, or unknown fields. Honeypot, message/name/email/category validation, a 32 KB body cap, 5 messages per IP/hour, and a 100/day site cap. Resend receives plain text, never user HTML.
- Uploads require an admin session, same origin, rate limit, one file, and at most 3 MB. Sharp decodes only still JPEG/PNG/WebP, caps input at 40 megapixels, rejects corrupt/SVG/animated files, strips metadata, resizes to a maximum 3,200-pixel edge, and encodes a fresh WebP with a random filename. Original filename paths are ignored.
- HTTPS/local-image URL validation blocks script schemes and malformed paths. Public content excludes unpublished artwork/event image settings and unapproved testimonial data.
- Per-request script nonces with strict-dynamic Content Security Policy; no unsafe-eval in production. Frame embedding is denied, object sources disabled, MIME sniffing disabled, browser camera/microphone/geolocation disabled, referrers limited, and HTTPS responses use HSTS.
- Revision checks prevent silently overwriting another editor's changes. No secret environment variables are serialized into client props.

## Production setup and limits

DATABASE_URL, ADMIN_PASSWORD, SESSION_SECRET, BLOB_READ_WRITE_TOKEN, and Resend sender/inbox/API settings still need to be connected in Vercel. Without these, the live preview is not a functioning publishing or email service. Keep credentials out of chat and source control.

This is a single-admin password system; individual accounts, MFA, recovery workflows, role permissions, and per-editor audit trails are not implemented. Use a password manager and restrict access to the hosting/database accounts. Uploaded image URLs are public by design; do not upload confidential files. No application can be guaranteed immune to attacks. Maintain dependency updates, monitor hosting/mail usage, and review provider firewall/bot controls for actual traffic.

## Validation

npm test covers public pages, unauthenticated access, origin rejection, password validation, cookie flags/tampering, logout replay rejection, login throttling, CRUD/revision conflicts, drafts, image framing persistence and bounds, unsafe URLs, corrupt/SVG image rejection, valid re-encoded uploads, public attachment rejection, malformed/oversized/chunked JSON, CSP nonce variation, and honest unconfigured-mail errors. Tests use isolated local data and never send real mail.

npm run build and npm audit are also part of the handoff checks. Browser checks verify framing, page galleries, desktop/mobile layouts, and production CSP compatibility.
