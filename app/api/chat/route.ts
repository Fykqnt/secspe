import { NextResponse } from "next/server"
import { generateContent } from "@/llm"

export const runtime = "nodejs"

type RequestBody = {
  message?: string
  imageDataUrl?: string | null
  history?: { role: "user" | "model"; content: string }[]
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody
    const rawHistory = (body.history || []).filter(Boolean)

    // Normalize history: drop leading non-user messages and ensure last is the current user message
    const normalized: { role: "user" | "model"; content: string }[] = []
    let seenUser = false
    for (const m of rawHistory) {
      if (!seenUser && m.role !== "user") {
        continue
      }
      seenUser = true
      normalized.push(m)
    }

    if (body.message) {
      normalized.push({ role: "user", content: body.message })
    }

    const text = await generateContent({
      imageDataUrl: body.imageDataUrl || null,
      messages: normalized,
    })
    return NextResponse.json({ text })
  } catch (err: any) {
    const message = typeof err === "string" ? err : err?.message || "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


