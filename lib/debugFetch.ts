// lib/debugFetch.ts

export default async function debugFetch(url: string, options?: RequestInit) {
  try {
    console.log(`🔹 [debugFetch] ${options?.method || 'GET'} ${url}`)

    if (options?.body) {
      try {
        const parsedBody = JSON.parse(options.body as string)
        console.log('📦 Request Body:', JSON.stringify(parsedBody, null, 2))
      } catch {
        console.log('📦 Request Body (raw):', options.body)
      }
    }

    const response = await fetch(url, options)
    console.log('📬 Status Code:', response.status)

    let body
    const contentType = response.headers.get("Content-Type") || ''

    if (contentType.includes("application/json")) {
      try {
        body = await response.json()
        console.log('📨 Response JSON:', JSON.stringify(body, null, 2))
      } catch (e) {
        console.error('❌ Failed to parse JSON response:', e)
        body = null
      }
    } else {
      body = await response.text()
      console.log('📨 Response Text:', body)
    }

    return { status: response.status, body }
  } catch (error) {
    console.error(`❌ [debugFetch] Failed to fetch ${url}:`, error)
    return { status: 500, body: { error: "Failed to fetch" } }
  }
}
