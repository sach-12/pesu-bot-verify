import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createResponse } from "@/utils/helpers";

// Authentication middleware function
export async function isAuthenticated(request) {
  const cookiesStore = cookies();
  const sessionToken = cookiesStore.get("pd_cookie")?.value;

  if (!sessionToken) {
    return createResponse(
      401,
      "Unauthorized",
      null,
      "Session token is missing"
    );
  }

  try {
    // Verify the JWT token
    const decoded_jwt = await jwtVerify(
      sessionToken,
      new TextEncoder().encode(process.env.JWT_SESSION_SECRET)
    );
    return NextResponse.next({
      request: {
        headers: new Headers({
          ...request.headers,
          "auth-token": decoded_jwt.payload.access_token,
        }),
      },
    });
  } catch (error) {
    return createResponse(401, "Unauthorized", null, "Invalid session token");
  }
}

const allowedOrigins = [
  "https://pesudiscord.vercel.app",
  "https://pesudiscord.netlify.app",
  "http://localhost:3000",
];

const corsOptions = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// CORS middleware function
export function corsMiddleware(request) {
  const origin = request.headers.get("origin") ?? "";
  const isAllowedOrigin =
    allowedOrigins.includes(origin) || allowedOrigins.includes("*");

  // Handle preflight requests
  const isPreflight = request.method === "OPTIONS";
  if (isPreflight) {
    const preflightHeaders = {
      ...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
      ...corsOptions,
    };
    return NextResponse.json({}, { headers: preflightHeaders });
  }

  // Handle simple requests
  const response = NextResponse.next();
  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Main middleware function that handles redirect to new site
export async function middleware(request) {
  // Redirect all traffic to the new site
  return NextResponse.redirect("https://pesudiscord.netlify.app", 301);
}

// Define which routes this middleware will run on (all routes)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
