import type { Config } from "@netlify/functions"
import { store } from "../lib/shared.mts"

// Anyone (the dashboard) can read the newest data. Read-only.
export default async (req: Request) => {
  const s = store()
  const [latest, events, radio] = await Promise.all([
    s.get("latest", { type: "json" }),
    s.get("events", { type: "json" }),
    s.get("radio", { type: "json" }),
  ])
  const receivedAt = (latest as { received_at?: string } | null)?.received_at
  const ageSeconds = receivedAt ? (Date.now() - Date.parse(receivedAt)) / 1000 : null
  const url = new URL(req.url)
  const body: Record<string, unknown> = {
    online: ageSeconds !== null && ageSeconds < 10,           // "live" if a reading arrived in the last 10 s
    age_s: ageSeconds === null ? null : Math.round(ageSeconds * 10) / 10,
    latest: latest ?? null,
    events: events ?? [],
    radio: radio ?? [],
  }
  if (url.searchParams.get("history") === "1") body.history = (await s.get("history", { type: "json" })) ?? []
  return Response.json(body, { headers: { "cache-control": "no-store" } })
}

export const config: Config = { path: "/api/latest", method: "GET" }
