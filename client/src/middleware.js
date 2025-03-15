import { NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Middleware to check if the user is authenticated
async function checkAuthentication(request) {
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

// Middleware to check if the user is subscribed
async function checkSubscription(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    console.log("No token found, redirecting to login");
    const loginUrl = new URL("/login", request.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const response = await fetch(`${apiUrl}/subscription/check-subscription`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(
        "API returned an error:",
        response.status,
        response.statusText
      );
      const subscriptionUrl = new URL("/subscription", request.nextUrl.origin);
      return NextResponse.redirect(subscriptionUrl);
    }

    const data = await response.json();
    console.log("API response data:", data);

    const isSubscribed = data.isSubscribed;
    console.log("isSubscribed value:", isSubscribed);

    if (!isSubscribed) {
      console.log("User is not subscribed, redirecting to /subscription");
      const subscriptionUrl = new URL("/subscription", request.nextUrl.origin);
      return NextResponse.redirect(subscriptionUrl);
    }

    console.log("User is subscribed, allowing access");
    return NextResponse.next();
  } catch (error) {
    console.error("Subscription check error:", error);
    const subscriptionUrl = new URL("/subscription", request.nextUrl.origin);
    return NextResponse.redirect(subscriptionUrl);
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Apply the subscription check only for the /learning and /call route
  if (pathname.startsWith("/learning") || pathname.startsWith("/call")) {
    return checkSubscription(request);
  }

  // Apply the authentication check for all other routes
  return checkAuthentication(request);
}

export const config = {
  matcher: [
    "/profile",
    "/blog",
    "/chat",
    "/community/:path*",
    "/dashboard",
    "/subscription",
    "/learning",
    "/call/:path*",
  ],
};
