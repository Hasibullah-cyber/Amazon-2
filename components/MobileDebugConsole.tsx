"use client"

import { useEffect, useRef, useState } from "react"

type LogType = "log" | "warn" | "error" | "info" | "exception"

interface LogEntry {
  type: LogType
  message: string
  timestamp: string
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
      const original = console[type] as (...args: any[]) => void
      console[type] = (...args: any[]) => {
        const message = args.map(arg =>
          typeof arg === "object" ? JSON.stringify(arg) : String(arg)
        ).join(" ")
        addLog(type, message)
        original(...args)
      }
    }

    captureLog("log")
    captureLog("warn")
    captureLog("error")
    captureLog("info")

    // Catch runtime exceptions
    window.onerror = (message, source, lineno, colno) => {
      addLog("exception", `[Exception] ${message} at ${source}:${lineno}:${colno}`)
    }

    // Catch unhandled promise rejections
    window.onunhandledrejection = (event: PromiseRejectionEvent) => {
      addLog("exception", `[Unhandled Rejection] ${event.reason}`)
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
      position.current.x = clientX - offset.current.x
      position.current.y = clientY - offset.current.y
      containerRef.current.style.left = `${position.current.x}px`
      containerRef.current.style.top = `${position.current.y}px`
    }

    const stopDragging = () => (dragging.current = false)

    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseup", stopDragging)
    window.addEventListener("touchmove", handleMove)
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
    offset.current.x = clientX - position.current.x
    offset.current.y = clientY - position.current.y
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
          borderRadius: "8px",
        }}
        onClick={() => setVisible(v => !v)}
      >
        {visible ? "Hide Console" : "Show Console"}
      </button>

      {visible && (
        <div
          ref={containerRef}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          style={{
            position: "fixed",
            top: position.current.y,
            left: position.current.x,
            width: "90%",
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
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: "bold", marginBottom: "6px" }}>🛠 Debug Console</div>
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
              }}
            >
              Clear
            </button>
          </div>

          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: "4px" }}>
              <span style={{ opacity: 0.5 }}>{log.timestamp}</span>{" "}
              <span
                style={{
                  color:
                    log.type === "error"
                      ? "red"
                      : log.type === "warn"
                      ? "orange"
                      : log.type === "info"
                      ? "#00bfff"
                      : log.type === "exception"
                      ? "#ff69b4"
                      : "white",
                }}
              >
                [{log.type.toUpperCase()}]
              </span>{" "}
              {log.message}
            </div>
          ))}

          <div ref={bottomRef} />
        </div>
      )}
    </>
  )
}
