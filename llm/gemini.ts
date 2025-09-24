export type ChatMessage = {
  role: "user" | "model"
  content: string
}

import { prompt as systemPrompt } from "@/llm/prompt"

type GenerateParams = {
  messages?: ChatMessage[]
  message?: string
  imageDataUrl?: string | null
  model?: string
}

function assertApiKey(): string {
  const key = process.env.API_KEY
  if (!key) {
    throw new Error("Missing API_KEY in environment variables.")
  }
  return key
}

function parseDataUrl(dataUrl: string): { mime_type: string; data: string } | null {
  const match = /^data:(.*?);base64,(.*)$/.exec(dataUrl)
  if (!match) return null
  const mimeType = match[1]
  const base64 = match[2]
  return { mime_type: mimeType, data: base64 }
}

function buildContents(params: GenerateParams) {
  const partsFromText = (text: string) => [{ text }]

  const contents: any[] = []

  if (params.messages && params.messages.length > 0) {
    for (const m of params.messages) {
      contents.push({ role: m.role, parts: partsFromText(m.content) })
    }
  } else if (params.message) {
    contents.push({ role: "user", parts: partsFromText(params.message) })
  }

  if (params.imageDataUrl) {
    const inline = parseDataUrl(params.imageDataUrl)
    if (inline) {
      // Append image to the last user message; if none exists, create one.
      const last = contents.length > 0 ? contents[contents.length - 1] : null
      if (last && last.role === "user") {
        last.parts.push({ inline_data: inline })
      } else {
        contents.push({ role: "user", parts: [{ inline_data: inline }] })
      }
    }
  }

  return contents
}

function extractText(responseJson: any): string {
  try {
    const candidates = responseJson?.candidates
    if (!Array.isArray(candidates) || candidates.length === 0) {
      const block = responseJson?.promptFeedback?.blockReason
      if (block) return `ポリシーによりブロックされました (${block})`
      return ""
    }

    const parts = candidates[0]?.content?.parts
    if (Array.isArray(parts)) {
      const texts = parts.map((p: any) => (typeof p?.text === "string" ? p.text : null)).filter(Boolean)
      if (texts.length > 0) return texts.join("\n").trim()

      // Fallback: try to extract any string value from parts (e.g., some models may return different keys)
      const anyStrings = parts
        .map((p: any) => {
          for (const v of Object.values(p || {})) {
            if (typeof v === "string" && v.trim().length > 0) return v
          }
          return null
        })
        .filter(Boolean) as string[]
      if (anyStrings.length > 0) return anyStrings.join("\n").trim()
    }

    const finishReason = candidates[0]?.finishReason
    const block = responseJson?.promptFeedback?.blockReason
    if (finishReason === "SAFETY" || block) {
      return `ポリシーによりブロックされました (${block || finishReason})`
    }

    return ""
  } catch {
    return ""
  }
}

export async function generateContent(params: GenerateParams): Promise<string> {
  const apiKey = assertApiKey()
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`

  const contents = buildContents(params)

  // Debug: validate last role
  try {
    const last = contents[contents.length - 1]
    if (!last || last.role !== "user") {
      console.warn("[Gemini] Last message role is not user; adjusting to meet API requirement.")
    }
  } catch {}

  const payload = {
    contents,
    systemInstruction: {
      role: "user",
      parts: [{ text: systemPrompt }],
    },
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    },
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    // The API key is only in query param; do not send in headers.
    cache: "no-store",
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw new Error(`Gemini request failed: ${response.status} ${response.statusText} ${detail}`)
  }

  const data = await response.json()
  const text = extractText(data)
  return text || "(応答が取得できませんでした)"
}


