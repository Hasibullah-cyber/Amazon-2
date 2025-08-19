"use client"

import { useEffect, useRef, useState } from "react"

type LogType = "log" | "warn" | "error" | "info" | "exception"

interface LogEntry {
  type: LogType
  message: string
  timestamp: string
}

// Preserve original console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
}

export default function MobileDebugConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [visible, setVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const position = useRef({ x: 10, y: 100 })
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })
  const bottomRef = useRef<HTMLDivElement>(null)

  const addLog = (type: LogType, message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev.slice(-99), { type, message, timestamp }])
  }

  useEffect(() => {
    // Hook into all console types
    const captureLog = (type: LogType) => {
      const original = originalConsole[type] || console[type]
      
      return (...args: any[]) => {
        try {
          const message = args.map(arg => {
            if (typeof arg === "object" && arg !== null) {
              try {
                return JSON.stringify(arg)
              } catch (e) {
                return `[Object: ${Object.prototype.toString.call(arg)}]`
              }
            }
            return String(arg)
          }).join(" ")
          
          addLog(type, message)
          original.apply(console, args)
        } catch (error) {
          original.apply(console, args)
        }
      }
    }

    // Override console methods
    console.log = captureLog("log")
    console.warn = captureLog("warn")
    console.error = captureLog("error")
    console.info = captureLog("info")

    // Catch runtime exceptions
    const errorHandler = (event: ErrorEvent) => {
      addLog("exception", `[Exception] ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`)
      return false
    }

    // Catch unhandled promise rejections
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      addLog("exception", `[Unhandled Rejection] ${event.reason}`)
    }

    window.addEventListener('error', errorHandler)
    window.addEventListener('unhandledrejection', rejectionHandler)

    // Restore original console methods on cleanup
    return () => {
      console.log = originalConsole.log
      console.warn = originalConsole.warn
      console.error = originalConsole.error
      console.info = originalConsole.info
      
      window.removeEventListener('error', errorHandler)
      window.removeEventListener('unhandledrejection', rejectionHandler)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current || !containerRef.current) return
      
      const clientX = (e as TouchEvent).touches?.[0]?.clientX ?? (e as MouseEvent).clientX
      const clientY = (e as TouchEvent).touches?.[0]?.clientY ?? (e as MouseEvent).clientY
      
      // Calculate new position
      const newX = clientX - offset.current.x
      const newY = clientY - offset.current.y
      
      // Boundary checks to keep within viewport
      const maxX = window.innerWidth - containerRef.current.offsetWidth
      const maxY = window.innerHeight - containerRef.current.offsetHeight
      
      position.current.x = Math.max(0, Math.min(newX, maxX))
      position.current.y = Math.max(0, Math.min(newY, maxY))
      
      containerRef.current.style.left = `${position.current.x}px`
      containerRef.current.style.top = `${position.current.y}px`
    }

    const stopDragging = () => {
      dragging.current = false
    }

    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseup", stopDragging)
    window.addEventListener("touchmove", handleMove, { passive: false })
    window.addEventListener("touchend", stopDragging)

    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", stopDragging)
      window.removeEventListener("touchmove", handleMove)
      window.removeEventListener("touchend", stopDragging)
    }
  }, [])

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    dragging.current = true
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      offset.current.x = clientX - rect.left
      offset.current.y = clientY - rect.top
    }
    
    // Prevent default to avoid text selection and other drag interactions
    e.preventDefault()
  }

  const clearLogs = () => setLogs([])

  return (
    <>
      <button
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 10000,
          padding: "10px 14px",
          background: "#000",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "bold",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        }}
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? "Hide debug console" : "Show debug console"}
      >
        {visible ? "Hide Console" : "Show Console"}
      </button>

      {visible && (
        <div
          ref={containerRef}
          style={{
            position: "fixed",
            top: `${position.current.y}px`,
            left: `${position.current.x}px`,
            width: "90%",
            maxWidth: "400px",
            maxHeight: "50%",
            overflowY: "auto",
            backgroundColor: "#1e1e1e",
            color: "white",
            fontSize: "12px",
            padding: "8px",
            borderRadius: "8px",
            zIndex: 9999,
            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            cursor: "move",
            touchAction: "none", // Important for touch drag to work properly
          }}
        >
          <div 
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            style={{ padding: "4px", marginBottom: "8px", borderBottom: "1px solid #444" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: "bold" }}>🛠 Debug Console</div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  clearLogs()
                }}
                style={{
                  fontSize: "10px",
                  background: "#333",
                  color: "#fff",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                }}
                aria-label="Clear console"
              >
                Clear
              </button>
            </div>
            <div style={{ fontSize: "10px", opacity: 0.7, marginTop: "4px" }}>
              Drag from here to move console
            </div>
          </div>

          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {logs.length === 0 ? (
              <div style={{ padding: "10px", textAlign: "center", opacity: 0.7 }}>
                No logs yet. Console messages will appear here.
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} style={{ marginBottom: "4px", wordBreak: "break-all" }}>
                  <span style={{ opacity: 0.5 }}>{log.timestamp}</span>{" "}
                  <span
                    style={{
                      color:
                        log.type === "error"
                          ? "#ff6b6b"
                          : log.type === "warn"
                          ? "#ffd93d"
                          : log.type === "info"
                          ? "#6bcb77"
                          : log.type === "exception"
                          ? "#ff9c6d"
                          : "white",
                      fontWeight: log.type === "error" || log.type === "exception" ? "bold" : "normal",
                    }}
                  >
                    [{log.type.toUpperCase()}]
                  </span>{" "}
                  {log.message}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      )}
    </>
  )
}
