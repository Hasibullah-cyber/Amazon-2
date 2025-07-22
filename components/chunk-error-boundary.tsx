"use client"

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
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
    // Special handling for hydration errors
    if (error.message.includes('hydrat') || error.message.includes('Minified React error')) {
      return {
        hasError: true,
        error: new Error('Content mismatch between server and client')
      }
    }
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught:', error, errorInfo)
    // You can add error logging to a service here
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload() // Full reload for chunk errors
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
          <div className="max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              {this.state.error?.message.includes('hydrat') 
                ? 'Content Loading Error' 
                : 'Something Went Wrong'}
            </h2>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message.includes('hydrat')
                ? 'The page content did not load properly. Please refresh.'
                : 'We encountered an error while loading this page.'}
            </p>
            <button
              onClick={this.handleRetry}
              className="px-5 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] rounded-md text-sm font-medium shadow-sm"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
