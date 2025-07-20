export async function debugFetch(url: string, options?: RequestInit) {
  try {
    console.log("[DEBUG] Fetching:", url)
    const res = await fetch(url, options)

    if (!res.ok) {
      const text = await res.text()
      console.error(`[ERROR] Fetch failed:
  URL: ${url}
  Status: ${res.status}
  StatusText: ${res.statusText}
  Response: ${text}`)
    }

    return res
  } catch (err: any) {
    console.error(`[ERROR] Network fetch failed:
  URL: ${url}
  Message: ${err.message || err}`)
    throw err
  }
}
