"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Input } from "./ui/input"
import { Send, User, Paperclip, X, ChevronDown } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useChat } from "@/contexts/chat-context"
import type { ChatMessage as ConversationMessage } from "@/contexts/chat-context"

type Message = ConversationMessage

export function ChatInterface() {
  const { currentConversation, setMessagesForCurrent, setTitleForCurrent } = useChat()
  const [messages, setMessages] = useState<Message[]>(currentConversation?.messages || [])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [showScrollHint, setShowScrollHint] = useState(false)
  const hintTimeoutRef = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    const el = scrollContainerRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
  }

  // Title heuristic: prefer AI summary box, else first AI line, else first user line
  const computeTitleFromTexts = (aiText: string, userText: string): string => {
    const normalize = (s: string) => s.replace(/\s+/g, " ").trim()
    let title = ""
    // Try to extract after 【結論（最短要約）】 up to next bracket or newline
    const idx = aiText.indexOf("【結論（最短要約）】")
    if (idx !== -1) {
      const after = aiText.slice(idx + "【結論（最短要約）】".length)
      const stop = after.search(/\n|【/)
      const segment = stop === -1 ? after : after.slice(0, stop)
      title = normalize(segment)
    }
    // Summarize entire exchange: combine first user line + best available AI line
    const firstUserLine = (userText.split(/\r?\n/).find((l) => normalize(l).length > 0) || "").slice(0, 40)
    const aiLine = (aiText.split(/\r?\n/).find((l) => normalize(l).length > 0) || "").slice(0, 40)
    if (!title && (firstUserLine || aiLine)) {
      title = normalize(`${firstUserLine}${firstUserLine && aiLine ? " → " : ""}${aiLine}`)
    }
    if (!title) {
      title = normalize(userText || "新しいチャット")
    }
    return title.slice(0, 40)
  }

  const handleScroll = () => {
    const el = scrollContainerRef.current
    if (!el) return
    const threshold = 80
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold
    setAutoScroll(nearBottom)
    // Hide hint immediately on manual scroll
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current)
    }
    setShowScrollHint(false)
  }

  useEffect(() => {
    setMessages(currentConversation?.messages || [])
  }, [currentConversation?.id])

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom("smooth")
    }
    // Show hint briefly only when generating and content is out of view
    if (isLoading && !autoScroll) {
      setShowScrollHint(true)
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current)
      }
      hintTimeoutRef.current = window.setTimeout(() => setShowScrollHint(false), 700)
    } else {
      setShowScrollHint(false)
    }
  }, [messages, autoScroll, isLoading])

  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current)
      }
    }
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedImage) || isLoading) return

    const userMessage: Message = {
      id: Date.now(),
      content: inputValue || "画像を送信しました",
      sender: "user",
      timestamp: new Date(),
      image: imagePreview || undefined,
    }

    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setMessagesForCurrent(nextMessages)
    setAutoScroll(true)
    setInputValue("")
    removeImage()
    setIsLoading(true)
    setIsThinking(true)

    try {
      const history = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        content: m.content,
      }))

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          imageDataUrl: userMessage.image || null,
          history,
        }),
      })

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("この機能を利用するにはサインインが必要です。ヘッダー右上のサインインからログインしてください。")
        }
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Request failed: ${res.status}`)
      }

      const data = (await res.json()) as { text?: string }
      const fullText = data.text || "(応答が空です)"

      // Set a conversation title based on the AI response (or user fallback)
      setTitleForCurrent(computeTitleFromTexts(fullText, userMessage.content))

      // Create an empty AI message, then stream-fill it
      const aiId = Date.now() + 1
      {
        const next = [...nextMessages, { id: aiId, content: "", sender: "ai" as const, timestamp: new Date() }]
        setMessages(next)
        setMessagesForCurrent(next)
      }

      // Hide thinking indicator now that streaming will begin
      setIsThinking(false)

      const chunkSize = 3
      const intervalMs = 16
      for (let i = 0; i < fullText.length; i += chunkSize) {
        await new Promise((r) => setTimeout(r, intervalMs))
        const end = Math.min(fullText.length, i + chunkSize)
        const next = fullText.slice(0, end)
        setMessages((prev) => {
          const updated = prev.map((m) => (m.id === aiId ? { ...m, content: next } : m))
          setMessagesForCurrent(updated)
          return updated
        })
        // Only auto-scroll if user is near the bottom
        if (autoScroll) {
          scrollToBottom()
        }
      }
      // Ensure final full text is set
      setMessages((prev) => {
        const updated = prev.map((m) => (m.id === aiId ? { ...m, content: fullText } : m))
        setMessagesForCurrent(updated)
        return updated
      })
      setIsLoading(false)
    } catch (error: any) {
      const aiMessage: Message = {
        id: Date.now() + 1,
        content: `エラーが発生しました: ${error?.message || "Unknown error"}`,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsThinking(false)
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex-1 flex flex-col bg-background min-h-0 overflow-hidden"
    >
      {/* Chat Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center space-x-3">
          <img src="/secspe_icon.png" alt="セキスペくん" className="w-10 h-10 rounded-full" />
          <div>
            <h2 className="text-xl font-semibold text-card-foreground">セキスペくん アシスタント</h2>
            <p className="text-base text-muted-foreground">オンライン - いつでもお手伝いします</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 relative">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-start space-x-3 max-w-full sm:max-w-[85%] md:max-w-[80%] ${
                  message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                {message.sender === "user" ? (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-accent text-accent-foreground">
                    <User className="h-4 w-4" />
                  </div>
                ) : (
                  <img src="/secspe_icon.png" alt="セキスペくん" className="w-8 h-8 rounded-full flex-shrink-0" />
                )}
                <Card
                  className={`p-4 ${
                    message.sender === "user" ? "bg-accent text-black dark:text-card-foreground" : "bg-card text-card-foreground"
                  }`}
                >
                  {message.image && (
                    <div className="mb-3">
                      <img
                        src={message.image || "/placeholder.svg"}
                        alt="Uploaded image"
                        className="max-w-full h-auto rounded-lg border border-border"
                        style={{ maxHeight: "200px" }}
                      />
                    </div>
                  )}
                  <div
                    className={`text-base leading-relaxed break-words whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert ${
                      message.sender === "user" ? "text-black dark:text-card-foreground" : ""
                    }`}
                    style={{ color: message.sender === "user" ? "#000" : undefined }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        hr: () => <br />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </Card>
                <div className="self-end text-sm opacity-70">
                  {message.timestamp.toLocaleTimeString("ja-JP", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isThinking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
            <Card className="p-3 bg-card text-card-foreground">
              <div className="flex items-center justify-center space-x-2">
                <div className="flex space-x-1">
                  <motion.div className="w-2 h-2 bg-primary rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }} />
                  <motion.div className="w-2 h-2 bg-primary rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.15 }} />
                  <motion.div className="w-2 h-2 bg-primary rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.3 }} />
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <div ref={messagesEndRef} />

        {showScrollHint && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              scrollToBottom("smooth")
              setAutoScroll(true)
              setShowScrollHint(false)
            }}
            className="pointer-events-auto absolute bottom-12 left-1/2 -translate-x-1/2 bg-primary/50 hover:bg-primary/70 text-primary-foreground shadow-lg rounded-full p-2 flex items-center justify-center backdrop-blur-sm"
          >
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}>
              <ChevronDown className="h-5 w-5" />
            </motion.div>
          </motion.button>
        )}
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className="bg-card border-t border-border p-4 shrink-0"
      >
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Preview"
              className="max-h-20 rounded-lg border border-border"
            />
            <Button
              onClick={removeImage}
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        <div className="flex items-end space-x-3">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            className="h-12 px-3"
            disabled={isLoading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="メッセージを入力してください..."
              className="min-h-[48px] resize-none bg-input border-border focus:ring-ring text-base"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={(!inputValue.trim() && !selectedImage) || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          ※セキスペくんの出力する内容はその正確性を100%保証するものではありません。
        </p>
      </motion.div>
    </motion.div>
  )
}
