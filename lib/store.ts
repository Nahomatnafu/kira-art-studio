import "server-only";
import { neon } from "@neondatabase/serverless";
import { Content, seed, contentSchema } from "./content";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
export const isLocal = () =>
  process.env.KIRA_LOCAL_STORE === "1" && process.env.NODE_ENV !== "production";
export const hasStore = () => Boolean(process.env.DATABASE_URL) || isLocal();
const localPath = () =>
  path.join(
    process.cwd(),
    "work",
    process.env.KIRA_TEST_STORE === "1" ? "test-content.json" : "content.json",
  );
export async function db() {
  if (!process.env.DATABASE_URL) throw new Error("Database is not configured");
  const sql = neon(process.env.DATABASE_URL);
  await sql`CREATE TABLE IF NOT EXISTS kira_content (id integer PRIMARY KEY CHECK (id=1), data jsonb NOT NULL)`;
  return sql;
}
export async function readContent(): Promise<Content> {
  if (process.env.DATABASE_URL) {
    const sql = await db();
    await sql`INSERT INTO kira_content(id,data) VALUES(1,${JSON.stringify(seed)}::jsonb) ON CONFLICT(id) DO NOTHING`;
    const rows = await sql`SELECT data FROM kira_content WHERE id=1`;
    return contentSchema.parse(rows[0].data);
  }
  if (isLocal()) {
    try {
      return contentSchema.parse(
        JSON.parse(await readFile(localPath(), "utf8")),
      );
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    }
  }
  return structuredClone(seed);
}
let localQueue: Promise<unknown> = Promise.resolve();
export async function saveContent(value: Content) {
  const data = contentSchema.parse(value);
  const next = { ...data, revision: data.revision + 1 };
  if (process.env.DATABASE_URL) {
    const sql = await db();
    const result =
      await sql`UPDATE kira_content SET data=${JSON.stringify(next)}::jsonb WHERE id=1 AND (data->>'revision')::integer=${data.revision} RETURNING id`;
    if (!result.length) throw new Error("CONFLICT");
    return next;
  }
  if (isLocal()) {
    const write = localQueue.then(async () => {
      if ((await readContent()).revision !== data.revision)
        throw new Error("CONFLICT");
      await mkdir(path.dirname(localPath()), { recursive: true });
      await writeFile(localPath() + ".tmp", JSON.stringify(next, null, 2));
      await rename(localPath() + ".tmp", localPath());
      return next;
    });
    localQueue = write.catch(() => {});
    return write;
  }
  throw new Error("Database is not configured");
}
