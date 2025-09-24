import { NextResponse } from "next/server"
import { clerkMiddleware } from "@clerk/nextjs/server"

const hasClerkEnv = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)
const bypass = process.env.BYPASS_CLERK_MIDDLEWARE === "1"

export default !bypass && hasClerkEnv
  ? clerkMiddleware()
  : function middleware() {
      // Bypass auth (either missing env or explicitly bypassing)
      return NextResponse.next()
    }

export const config = {
  // Limit middleware to API/TRPC routes to reduce surface of failures
  matcher: ["/(api|trpc)(.*)"],
}