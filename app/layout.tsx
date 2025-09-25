import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

export const metadata: Metadata = {
  title: "セキスペくん - 情報処理安全確保支援特化のAIチューター",
  description: "情報処理安全確保支援特化のAIチューター。迅速で正確な回答を提供し、ユーザー体験を向上させます。",
  generator: "セキスペくん",
  icons: {
    icon: "/secspe_icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  if (!clerkPublishableKey) {
    // Log once on the server to help diagnose missing env in CI/CD
    console.warn(
      "[Clerk] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing. Rendering without ClerkProvider."
    )
  }
  return (
    <html lang="ja">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        {clerkPublishableKey ? (
          <ClerkProvider publishableKey={clerkPublishableKey}>
            <Suspense fallback={null}>{children}</Suspense>
          </ClerkProvider>
        ) : (
          <Suspense fallback={null}>{children}</Suspense>
        )}
      </body>
    </html>
  )
}
