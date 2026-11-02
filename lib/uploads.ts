import "server-only";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
export async function uploadImage(file: File) {
  if (file.size > 3 * 1024 * 1024)
    throw new Error("Please choose an image smaller than 3 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  let ext = "";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ext = "jpg";
  if (
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    ext = "png";
  if (
    bytes.subarray(0, 4).toString() === "RIFF" &&
    bytes.subarray(8, 12).toString() === "WEBP"
  )
    ext = "webp";
  if (!ext) throw new Error("Please use a JPG, PNG, or WebP image.");
  const name = `artwork/${randomUUID()}.${ext}`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(name, bytes, {
      access: "public",
      contentType: ext === "jpg" ? "image/jpeg" : `image/${ext}`,
      addRandomSuffix: true,
    });
    return blob.url;
  }
  if (
    process.env.KIRA_LOCAL_STORE === "1" &&
    process.env.NODE_ENV !== "production"
  ) {
    const directory = path.join(process.cwd(), "public", "uploads");
    await mkdir(directory, { recursive: true });
    const filename = path.basename(name);
    await writeFile(path.join(directory, filename), bytes);
    return "/uploads/" + filename;
  }
  throw new Error(
    "Image storage is not connected yet. You can use an HTTPS image URL instead.",
  );
}
