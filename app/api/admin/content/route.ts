import { NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/auth";
import { readContent, saveContent } from "@/lib/store";
import { contentSchema } from "@/lib/content";
export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  try {
    return NextResponse.json(await readContent(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load studio content." },
      { status: 503 },
    );
  }
}
export async function PUT(req: Request) {
  if (!sameOrigin(req) || !(await isAdmin()))
    return NextResponse.json(
      { error: "Please sign in again." },
      { status: 403 },
    );
  if (Number(req.headers.get("content-length") || 0) > 1000000)
    return NextResponse.json(
      { error: "Content is too large." },
      { status: 413 },
    );
  try {
    const text = await req.text();
    if (text.length > 1000000)
      return NextResponse.json(
        { error: "Content is too large." },
        { status: 413 },
      );
    const parsed = contentSchema.safeParse(JSON.parse(text));
    if (!parsed.success)
      return NextResponse.json(
        {
          error: parsed.error.issues
            .map((x) => `${x.path.join(".")}: ${x.message}`)
            .join("; "),
        },
        { status: 400 },
      );
    return NextResponse.json(await saveContent(parsed.data));
  } catch (e) {
    if ((e as Error).message === "CONFLICT")
      return NextResponse.json(
        {
          error:
            "Another editor saved changes. Reload the dashboard before trying again.",
        },
        { status: 409 },
      );
    return NextResponse.json(
      { error: "Could not save your changes. Please try again." },
      { status: 503 },
    );
  }
}
