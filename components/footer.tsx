"use client"

import { motion } from "framer-motion"

export function Footer() {
  return (
    <motion.footer
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
      className="bg-primary text-primary-foreground border-t border-primary/20"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-6 text-sm">
            <motion.a
              href="/privacy"
              className="hover:text-accent transition-colors"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              プライバシーポリシー
            </motion.a>
            <motion.a
              href="/terms"
              className="hover:text-accent transition-colors"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              利用規約
            </motion.a>
            <motion.a
              href="https://arrowheads.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              運営会社
            </motion.a>
          </div>
          <div className="text-sm text-primary-foreground/80">© 2025 セキスペくん. All rights reserved.</div>
        </div>
      </div>
    </motion.footer>
  )
}
