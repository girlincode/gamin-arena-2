"use client";

import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-black/60 backdrop-blur-xl p-8 rounded-2xl border border-red-500/30 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-6">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.reload();
                }}
                className="bg-gradient-to-r from-purple-600 to-violet-600"
              >
                Try Again
              </Button>
              <ErrorBoundaryHomeButton />
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ErrorBoundaryHomeButton() {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.push("/")}
      variant="outline"
      className="border-purple-500/30"
    >
      <Home className="w-4 h-4 mr-2" />
      Go Home
    </Button>
  );
}
