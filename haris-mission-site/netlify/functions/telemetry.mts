import type { Config } from "@netlify/functions"
import { authorised, readJson, store, pushCapped } from "../lib/shared.mts"

// The CubeSat (ESP32) posts one JSON reading per second here.
export default async (req: Request) => {
  if (!authorised(req)) return new Response("Unauthorized", { status: 401 })
  const data = await readJson(req)
  if (!data) return new Response("Bad JSON", { status: 400 })

  const reading = { ...data, received_at: new Date().toISOString() }
  await store().setJSON("latest", reading)
  await pushCapped("history", reading, 300)                 // last ~5 minutes at 1 Hz
  if (data.event && data.event !== null) {
    await pushCapped("events", { ...(data.event as object), received_at: reading.received_at }, 50)
  }
  return new Response(null, { status: 204 })
}

export const config: Config = { path: "/api/telemetry", method: "POST" }
