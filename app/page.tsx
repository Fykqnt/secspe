import React from "react"
import { Header } from "../components/header"
import { ChatInterface } from "../components/chat-interface"
import { Sidebar } from "../components/sidebar"
import { Footer } from "../components/footer"
import { ChatProvider } from "@/contexts/chat-context"

export default function HomePage() {
  return (
    <ChatProvider>
      <div className="h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex min-h-0 overflow-hidden">
          <Sidebar />
          <ChatInterface />
        </main>
        <Footer />
      </div>
    </ChatProvider>
  )
}
