import { NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    // If no token, redirect to login
    const loginUrl = new URL("/login", request.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify the token by calling the /verify/login API
    const response = await fetch(`${apiUrl}/auth/verify/login`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!data.success) {
      // If verification fails, redirect to login
      const loginUrl = new URL("/login", request.nextUrl.origin);
      return NextResponse.redirect(loginUrl);
    }

    // If verification succeeds, allow access to the route
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    const loginUrl = new URL("/login", request.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/profile", "/blog", "/chat", "/community/:path*", "/dashboard"],
};
