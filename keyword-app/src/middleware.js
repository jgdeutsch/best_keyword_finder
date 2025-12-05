import { auth } from "@/app/api/auth/[...nextauth]/route"

export default auth((req) => {
  const { pathname } = req.nextUrl
  
  // Allow access to login page and API auth routes
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return
  }
  
  // For all other routes, auth middleware will handle authentication
  // If not authenticated, it will redirect to login
})

export const config = {
  matcher: [
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ]
}

