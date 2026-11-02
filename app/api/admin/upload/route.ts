import { NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/auth";
import { uploadImage } from "@/lib/uploads";
export async function POST(req: Request) {
  if (!sameOrigin(req) || !(await isAdmin()))
    return NextResponse.json({ error: "Please sign in." }, { status: 403 });
  if (Number(req.headers.get("content-length") || 0) > 3400000)
    return NextResponse.json(
      { error: "Maximum image size is 3 MB." },
      { status: 413 },
    );
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new Error("Please select an image.");
    return NextResponse.json({ url: await uploadImage(file) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
