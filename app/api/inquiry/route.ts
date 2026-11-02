import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, sameOrigin } from "@/lib/auth";
const schema = z.object({
  kind: z.enum(["contact", "commission", "community", "experience"]),
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  phone: z.string().max(40),
  size: z.string().max(100),
  category: z.string().max(100),
  message: z.string().trim().min(10).max(6000),
  website: z.string().max(200),
});
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  if (
    !process.env.RESEND_API_KEY ||
    !process.env.CONTACT_TO_EMAIL ||
    !process.env.CONTACT_FROM_EMAIL
  )
    return NextResponse.json(
      {
        error:
          "The studio contact form is being connected. Please check back soon.",
      },
      { status: 503 },
    );
  if (Number(req.headers.get("content-length") || 0) > 3400000)
    return NextResponse.json(
      { error: "Please keep your attachment below 3 MB." },
      { status: 413 },
    );
  try {
    const form = await req.formData();
    const parsed = schema.safeParse(
      Object.fromEntries(
        [
          "kind",
          "name",
          "email",
          "phone",
          "size",
          "category",
          "message",
          "website",
        ].map((k) => [k, String(form.get(k) || "")]),
      ),
    );
    if (!parsed.success)
      return NextResponse.json(
        {
          error:
            "Please enter your name, a valid email, and a message of at least 10 characters.",
        },
        { status: 400 },
      );
    const data = parsed.data;
    if (data.website)
      return NextResponse.json(
        { error: "Unable to submit this request." },
        { status: 400 },
      );
    if (!(await rateLimit(req, "inquiry", 5, 3600)))
      return NextResponse.json(
        {
          error:
            "You have reached the hourly message limit. Please try again later.",
        },
        { status: 429 },
      );
    const attachments: { filename: string; content: string }[] = [];
    const file = form.get("inspiration");
    if (file instanceof File && file.size) {
      if (file.size > 3 * 1024 * 1024)
        return NextResponse.json(
          { error: "Please choose an image smaller than 3 MB." },
          { status: 400 },
        );
      const bytes = Buffer.from(await file.arrayBuffer());
      const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
      const png = bytes
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      const webp =
        bytes.subarray(0, 4).toString() === "RIFF" &&
        bytes.subarray(8, 12).toString() === "WEBP";
      if (!jpg && !png && !webp)
        return NextResponse.json(
          {
            error: "Inspiration attachments must be JPG, PNG, or WebP images.",
          },
          { status: 400 },
        );
      attachments.push({
        filename: "inspiration." + (jpg ? "jpg" : png ? "png" : "webp"),
        content: bytes.toString("base64"),
      });
    }
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL,
        to: [process.env.CONTACT_TO_EMAIL],
        reply_to: data.email,
        subject: `KIRA ${data.kind} inquiry · ${data.name.replace(/[\r\n]/g, " ")}`,
        text: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || "Not supplied"}\nSize: ${data.size || "Not supplied"}\nCategory: ${data.category || "Not supplied"}\n\n${data.message}`,
        attachments,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("Email provider failed");
    return NextResponse.json({
      ok: true,
      message:
        "Thank you for reaching out. Your message is on its way to the studio. We look forward to connecting with you.",
    });
  } catch {
    return NextResponse.json(
      { error: "Your message could not be sent. Please try again shortly." },
      { status: 502 },
    );
  }
}
