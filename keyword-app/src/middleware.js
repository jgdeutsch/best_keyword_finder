import { auth } from "@/app/api/auth/[...nextauth]/route"

export default auth

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - login (login page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions (e.g., .png, .jpg, etc.)
     */
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ]
}

