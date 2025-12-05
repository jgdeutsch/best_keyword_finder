import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: [
    "/",
    "/bulk",
    "/api/search/:path*",
  ]
}

