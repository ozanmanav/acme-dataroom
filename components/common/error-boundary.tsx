"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  showDetails?: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold">Something went wrong</h2>
                  <p className="text-sm">
                    We're sorry, but something unexpected happened. Please try refreshing the page.
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                      className="flex items-center space-x-2"
                    >
                      {this.state.showDetails ? (
                        <>
                          <ChevronUp size={16} />
                          <span>Hide Details</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          <span>Show Details</span>
                        </>
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="flex items-center space-x-2"
                    >
                      <RefreshCw size={16} />
                      <span>Refresh Page</span>
                    </Button>
                  </div>
                  
                  {this.state.showDetails && this.state.error && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-md">
                      <p className="text-xs font-mono text-gray-700 break-all">
                        {this.state.error.toString()}
                      </p>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
