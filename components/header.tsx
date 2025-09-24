"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-primary text-primary-foreground shadow-lg border-b border-primary/20"
    >
      <div className="container mx-auto pr-4 pl-1 py-[0.6rem]">
        <div className="flex items-start justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="flex items-center space-x-2">
              <Image
                src="/secspe_logo.png"
                alt="セキスペくんロゴ"
                width={277}
                height={55}
                className="h-[55px] w-auto bg-transparent"
                priority
              />
            </div>
            <div>
              <h1 className="sr-only">セキスペくん</h1>
            </div>
          </motion.div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3 self-center">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  サインイン
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-primary-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4 pt-4 border-t border-primary-foreground/20"
          >
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3 pt-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">
                      サインイン
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>
          </motion.nav>
        )}
      </div>
    </motion.header>
  )
}
