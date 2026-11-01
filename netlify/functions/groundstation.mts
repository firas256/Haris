import type { Config } from "@netlify/functions"
import { authorised, readJson, pushCapped } from "../lib/shared.mts"

// The ground-station ESP32 forwards every radio packet it receives here.
export default async (req: Request) => {
  if (!authorised(req)) return new Response("Unauthorized", { status: 401 })
  const data = await readJson(req)
  if (!data || typeof data.raw !== "string") return new Response("Bad JSON", { status: 400 })
  await pushCapped("radio", { ...data, received_at: new Date().toISOString() }, 50)
  return new Response(null, { status: 204 })
}

export const config: Config = { path: "/api/groundstation", method: "POST" }
