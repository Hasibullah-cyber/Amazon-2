// lib/debugFetch.ts

export default async function debugFetch(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options)
    const contentType = response.headers.get("Content-Type")
    let body

    if (contentType?.includes("application/json")) {
      body = await response.json()
    } else {
      body = await response.text()
    }

    console.log(`✅ [debugFetch] ${options?.method || 'GET'} ${url}`)
    console.log("↪️ Status:", response.status)
    console.log("↪️ Response:", body)

    return { status: response.status, body }
  } catch (error: any) {
    console.error(`❌ [debugFetch] Failed to fetch ${url}:`, error)
    return { status: 500, body: { error: "Failed to fetch" } }
  }
}
