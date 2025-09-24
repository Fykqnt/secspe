"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, MessageSquare, History, Settings, HelpCircle, Plus } from "lucide-react"
import { useChat } from "@/contexts/chat-context"

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { conversations, currentId, setCurrentId, createConversation } = useChat()

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`bg-card border-r border-border transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-80"
      } hidden lg:block min-h-0`}
    >
      <div className="p-4 h-full flex flex-col min-h-0">
        {/* Toggle Button */}
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="hover:bg-muted">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 space-y-4 overflow-y-auto min-h-0"
            >
              {/* New Chat Button */}
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => createConversation()}
              >
                <Plus className="h-4 w-4 mr-2" />
                新しいチャット
              </Button>

              {/* Chat History */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                  <History className="h-4 w-4 mr-2" />
                  チャット履歴
                </h3>
                <div className="space-y-2">
                  {conversations.map((chat) => (
                    <motion.div
                      key={chat.id}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Card
                        onClick={() => setCurrentId(chat.id)}
                        className={`p-3 cursor-pointer transition-colors ${
                          currentId === chat.id ? "bg-muted/70" : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-card-foreground truncate">{chat.title || "無題"}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(chat.updatedAt).toLocaleString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-auto space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  設定
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  ヘルプ
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center space-y-4"
          >
            <Button size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <History className="h-4 w-4" />
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.aside>
  )
}
