import { NextResponse } from "next/server";
import {
  authReady,
  checkPassword,
  createSession,
  isAdmin,
  rateLimit,
  sameOrigin,
} from "@/lib/auth";
import { hasStore } from "@/lib/store";
export async function GET() {
  return NextResponse.json({
    authenticated: await isAdmin(),
    configured: authReady() && hasStore(),
  });
}
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  if (!authReady() || !hasStore())
    return NextResponse.json(
      {
        error:
          "Admin access is waiting for the database and secure login configuration.",
      },
      { status: 503 },
    );
  try {
    if (!(await rateLimit(req, "login", 5, 900)))
      return NextResponse.json(
        { error: "Too many attempts. Please try again in 15 minutes." },
        { status: 429 },
      );
    const { password } = await req.json();
    if (
      typeof password !== "string" ||
      password.length > 500 ||
      !checkPassword(password)
    )
      return NextResponse.json(
        { error: "The password is incorrect." },
        { status: 401 },
      );
    const response = NextResponse.json({ ok: true });
    response.cookies.set("kira_session", createSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 28800,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
}
export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return new Response(null, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("kira_session", "", { maxAge: 0, path: "/" });
  return response;
}
