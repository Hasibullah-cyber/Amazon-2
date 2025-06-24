
"use client"

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ChunkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's a chunk loading error
    if (error.message && (
      error.message.includes('ChunkLoadError') ||
      error.message.includes('Loading chunk') ||
      error.message.includes('timeout')
    )) {
      return { hasError: true, error }
    }
    return { hasError: false }
  }

  componentDidCatch(error: Error) {
    if (error.message && (
      error.message.includes('ChunkLoadError') ||
      error.message.includes('Loading chunk') ||
      error.message.includes('timeout')
    )) {
      console.log('Chunk loading error caught, attempting reload...')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Loading...</h2>
            <p className="text-gray-600">Please wait while we refresh the page.</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
