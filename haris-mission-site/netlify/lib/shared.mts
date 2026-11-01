import { getStore } from "@netlify/blobs"

// One store for everything the CubeSat and ground station send.
export const store = () => getStore("haris")

// Only devices that know the secret key (Netlify env var HARIS_API_KEY) may write.
export function authorised(req: Request): boolean {
  const key = Netlify.env.get("HARIS_API_KEY")
  return !!key && req.headers.get("x-haris-key") === key
}

// Read a small JSON body safely (max 8 kB).
export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  const text = await req.text()
  if (text.length === 0 || text.length > 8000) return null
  try {
    const data = JSON.parse(text)
    return data && typeof data === "object" && !Array.isArray(data) ? data : null
  } catch {
    return null
  }
}

// Append to a capped list stored as one JSON blob.
export async function pushCapped(name: string, item: unknown, max: number) {
  const s = store()
  const list = ((await s.get(name, { type: "json" })) as unknown[] | null) ?? []
  list.push(item)
  await s.setJSON(name, list.slice(-max))
}
