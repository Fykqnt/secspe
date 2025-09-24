"use client"

import React, { createContext, useContext, useMemo, useState, useCallback } from "react"

export type ChatRole = "user" | "ai"

export type ChatMessage = {
  id: number
  content: string
  sender: ChatRole
  timestamp: Date
  image?: string
}

export type Conversation = {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

type ChatContextValue = {
  conversations: Conversation[]
  currentId: string
  currentConversation: Conversation | null
  createConversation: () => string
  setCurrentId: (id: string) => void
  setMessagesForCurrent: (messages: ChatMessage[]) => void
  setTitleForCurrent: (title: string) => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const initialConversation: Conversation = useMemo(() => {
    const greeting: ChatMessage = {
      id: Date.now(),
      content: "こんにちは！\nAIチューターのセキスペくんと申します。\nご質問がございましたら、お気軽にお尋ねください。",
      sender: "ai",
      timestamp: new Date(),
    }
    return {
      id: generateId(),
      title: "新しいチャット",
      messages: [greeting],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  }, [])

  const [conversations, setConversations] = useState<Conversation[]>([initialConversation])
  const [currentId, setCurrentId] = useState<string>(initialConversation.id)

  const currentConversation = useMemo(
    () => conversations.find((c) => c.id === currentId) || null,
    [conversations, currentId],
  )

  const createConversation = useCallback(() => {
    const id = generateId()
    const greeting: ChatMessage = {
      id: Date.now(),
      content: "こんにちは！\nAIチューターのセキスペくんと申します。\nご質問がございましたら、お気軽にお尋ねください。",
      sender: "ai",
      timestamp: new Date(),
    }
    const conv: Conversation = {
      id,
      title: "新しいチャット",
      messages: [greeting],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setConversations((prev) => [conv, ...prev])
    setCurrentId(id)
    return id
  }, [])

  const setMessagesForCurrent = useCallback((messages: ChatMessage[]) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === currentId ? { ...c, messages, updatedAt: Date.now() } : c)),
    )
  }, [currentId])

  const setTitleForCurrent = useCallback((title: string) => {
    setConversations((prev) => prev.map((c) => (c.id === currentId ? { ...c, title } : c)))
  }, [currentId])

  const value: ChatContextValue = {
    conversations,
    currentId,
    currentConversation,
    createConversation,
    setCurrentId,
    setMessagesForCurrent,
    setTitleForCurrent,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChat must be used within ChatProvider")
  return ctx
}


