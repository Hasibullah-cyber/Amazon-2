// lib/debugClient.ts

let errorBox: HTMLDivElement | null = null

function createErrorBox(message: string) {
  if (!errorBox) {
    errorBox = document.createElement("div")
    errorBox.style.position = "fixed"
    errorBox.style.bottom = "0"
    errorBox.style.left = "0"
    errorBox.style.width = "100%"
    errorBox.style.maxHeight = "40vh"
    errorBox.style.overflowY = "auto"
    errorBox.style.backgroundColor = "#1e1e1e"
    errorBox.style.color = "#ff4d4f"
    errorBox.style.fontFamily = "monospace"
    errorBox.style.fontSize = "14px"
    errorBox.style.padding = "10px"
    errorBox.style.zIndex = "9999"
    errorBox.style.borderTop = "2px solid red"
    document.body.appendChild(errorBox)
  }

  const time = new Date().toLocaleTimeString()
  const line = document.createElement("div")
  line.textContent = `[${time}] ${message}`
  errorBox.appendChild(line)
}

export function setupFrontendErrorLogger() {
  if (process.env.NODE_ENV !== "development") return

  window.addEventListener("error", (event) => {
    console.error("🌐 Frontend JS Error:", event.error)
    createErrorBox(`❌ JS Error: ${event.message}`)
  })

  window.addEventListener("unhandledrejection", (event) => {
    console.error("🚨 Unhandled Promise Rejection:", event.reason)
    createErrorBox(`❗ Promise Rejection: ${event.reason}`)
  })
}
