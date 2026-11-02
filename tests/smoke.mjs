import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFile, writeFile, unlink } from "node:fs/promises";
import assert from "node:assert/strict";
const port = 3187,
  origin = `http://127.0.0.1:${port}`;
const password = randomBytes(24).toString("hex");
let log = "";
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "dev",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  {
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      NODE_ENV: "development",
      DATABASE_URL: "",
      KIRA_LOCAL_STORE: "1",
      KIRA_TEST_STORE: "1",
      ADMIN_PASSWORD: password,
      SESSION_SECRET: randomBytes(48).toString("hex"),
      RESEND_API_KEY: "",
    },
  },
);
server.stdout.on("data", (d) => (log += d));
server.stderr.on("data", (d) => (log += d));
const request = (url, options = {}) =>
  fetch(origin + url, {
    ...options,
    headers: { Origin: origin, ...options.headers },
  });
try {
  for (let n = 0; n < 120; n++) {
    try {
      const r = await request("/api/admin/session");
      if (r.ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
    if (n === 119) throw new Error("Test server did not start: " + log);
  }
  for (const route of [
    "/",
    "/about",
    "/artwork",
    "/collections",
    "/commissions",
    "/exhibitions",
    "/community",
    "/contact",
    "/admin",
    "/artwork/quiet-majesty",
  ]) {
    assert.equal((await request(route)).status, 200, route);
    console.log("PASS page " + route);
  }
  assert.equal((await request("/does-not-exist")).status, 404);
  assert.equal((await request("/api/admin/content")).status, 401);
  assert.equal(
    (
      await request("/api/admin/content", {
        method: "PUT",
        body: "{}",
        headers: { Origin: "https://example.org" },
      })
    ).status,
    403,
  );
  assert.equal(
    (await request("/api/admin/upload", { method: "POST" })).status,
    403,
  );
  assert.equal(
    (
      await request("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "wrong" }),
      })
    ).status,
    401,
  );
  const login = await request("/api/admin/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie").split(";")[0];
  assert.match(login.headers.get("set-cookie"), /HttpOnly/i);
  assert.match(login.headers.get("set-cookie"), /SameSite=strict/i);
  const headers = { "Content-Type": "application/json", Cookie: cookie };
  let content = await (await request("/api/admin/content", { headers })).json();
  const original = structuredClone(content);
  content.artworks[0].status = "sold";
  content.artworks[0].title = "Smoke Test Sold";
  const saved = await request("/api/admin/content", {
    method: "PUT",
    headers,
    body: JSON.stringify(content),
  });
  assert.equal(saved.status, 200);
  content = await saved.json();
  assert.equal(content.revision, original.revision + 1);
  const publicPage = await (await request("/artwork/quiet-majesty")).text();
  assert.match(publicPage, /Smoke Test Sold/);
  assert.match(publicPage, /In a private collection/);
  assert.equal(
    (
      await request("/api/admin/content", {
        method: "PUT",
        headers,
        body: JSON.stringify(original),
      })
    ).status,
    409,
  );
  const bad = structuredClone(content);
  bad.artworks[0].image = "javascript:alert(1)";
  assert.equal(
    (
      await request("/api/admin/content", {
        method: "PUT",
        headers,
        body: JSON.stringify(bad),
      })
    ).status,
    400,
  );
  const duplicate = structuredClone(content);
  duplicate.artworks.push(duplicate.artworks[0]);
  assert.equal(
    (
      await request("/api/admin/content", {
        method: "PUT",
        headers,
        body: JSON.stringify(duplicate),
      })
    ).status,
    400,
  );
  const id = "test-added-art";
  content.artworks.push({
    ...original.artworks[0],
    id,
    slug: id,
    title: "Added artwork",
    published: false,
  });
  content.collections.push({
    id: "test-collection",
    title: "Test collection",
    description: "A test collection.",
    image: "",
    comingSoon: true,
  });
  content.events.push({
    id: "test-event",
    title: "Test event",
    date: "2027-01-01",
    time: "6 p.m.",
    location: "Portland",
    description: "Test event.",
    image: "",
    ticketUrl: "",
    confirmed: false,
    published: false,
  });
  let update = await request("/api/admin/content", {
    method: "PUT",
    headers,
    body: JSON.stringify(content),
  });
  assert.equal(update.status, 200);
  content = await update.json();
  assert.equal((await request("/artwork/" + id)).status, 404);
  content.artworks = content.artworks.filter((x) => x.id !== id);
  content.collections = content.collections.filter(
    (x) => x.id !== "test-collection",
  );
  content.events = content.events.filter((x) => x.id !== "test-event");
  update = await request("/api/admin/content", {
    method: "PUT",
    headers,
    body: JSON.stringify(content),
  });
  assert.equal(update.status, 200);
  const upload = new FormData();
  upload.set(
    "file",
    new File(["bad image bytes"], "fake.jpg", { type: "image/jpeg" }),
  );
  assert.equal(
    (
      await request("/api/admin/upload", {
        method: "POST",
        headers: { Cookie: cookie },
        body: upload,
      })
    ).status,
    400,
  );
  const validUpload = new FormData();
  validUpload.set(
    "file",
    new File([await readFile("public/images/hero-art.webp")], "art.png", {
      type: "image/png",
    }),
  );
  const ur = await request("/api/admin/upload", {
    method: "POST",
    headers: { Cookie: cookie },
    body: validUpload,
  });
  assert.equal(ur.status, 200);
  const uploaded = (await ur.json()).url;
  assert.equal((await request(uploaded)).status, 200);
  await unlink("public" + uploaded);
  const form = new FormData();
  form.set("kind", "contact");
  form.set("name", "Studio Test");
  form.set("email", "test@example.com");
  form.set("message", "A message that must not be falsely accepted.");
  assert.equal(
    (await request("/api/inquiry", { method: "POST", body: form })).status,
    503,
  );
  assert.equal(
    (
      await request("/api/admin/session", {
        method: "DELETE",
        headers: { Cookie: cookie },
      })
    ).status,
    200,
  );
  console.log(
    "PASS authentication, CSRF, validation, concurrency, CRUD, draft privacy, image validation/upload, and unconfigured email handling",
  );
} catch (e) {
  console.error(log.slice(-10000));
  throw e;
} finally {
  server.kill();
  await unlink("work/test-content.json").catch(() => {});
}
