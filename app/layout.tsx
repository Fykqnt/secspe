import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

export const metadata: Metadata = {
  title: "セキスペくん - 公認会計士試験特化のAIチューター",
  description: "公認会計士試験特化のAIチューター。迅速で正確な回答を提供し、ユーザー体験を向上させます。",
  generator: "セキスペくん",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ClerkProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </ClerkProvider>
      </body>
    </html>
  )
}
