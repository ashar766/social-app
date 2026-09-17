import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  const isLoggedIn = !!request.auth;

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/posts/:path*",
    "/create-post/:path*",
    "/profile/:path*",
    "/post/:path*",
    "/search/:path*",
  ],
};
