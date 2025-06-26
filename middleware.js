import axios from "axios";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createResponse } from "@/utils/helpers";

// Authentication middleware function
export async function isAuthenticated(request) {
  const cookiesStore = await cookies();
  const sessionToken = cookiesStore.get("pd-session-jwt")?.value;

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
    const decoded_jwt = jwt.verify(
      sessionToken,
      process.env.JWT_SESSION_SECRET
    );
    request.auth = JSON.parse(JSON.stringify(decoded_jwt));
  } catch (error) {
    return createResponse(401, "Unauthorized", null, "Invalid session token");
  }

  return NextResponse.next();
}

const allowedOrigins = [
  "https://pesu-discord.vercel.app",
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

// Main middleware function that combines both
export async function middleware(request) {
  const authRoutes = ["/api/user"];
  const pathname = request.nextUrl.pathname;

  // Apply CORS to all routes
  const corsResponse = corsMiddleware(request);

  // Check authentication only for protected routes
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    return isAuthenticated(request);
  }

  return corsResponse;
}

// Define which routes this middleware will run on
export const config = {
  matcher: [
    // Apply to all routes except static files
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
