import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === "ADMIN"
    const isUser = token?.role === "USER"
    const isAuthPage = req.nextUrl.pathname.startsWith("/login")

    // Redirect authenticated users away from login page
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Protect admin-only routes
    if (
      (req.nextUrl.pathname.startsWith("/admin") ||
        req.nextUrl.pathname.startsWith("/users") ||
        req.nextUrl.pathname.startsWith("/activity")) &&
      !isAdmin
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Protect user routes
    if (req.nextUrl.pathname.startsWith("/user") && !isUser && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/user/:path*",
    "/dashboard/:path*",
    "/orders/:path*",
    "/products/:path*",
    "/users/:path*",
    "/activity/:path*",
    "/steps/:path*",
  ],
}

