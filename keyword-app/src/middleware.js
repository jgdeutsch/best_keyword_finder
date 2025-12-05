import { auth } from "@/app/api/auth/[...nextauth]/route"

export default auth((req) => {
  // Middleware logic - auth is handled automatically
  // If not authenticated, NextAuth will redirect to login page
})

export const config = {
  matcher: [
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)",
  ]
}

