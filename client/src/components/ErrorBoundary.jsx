import React from "react";
import { Link } from "react-router-dom";

/**
 * ErrorBoundary — Catches unhandled React render errors.
 * Shows a beautiful fallback UI instead of a blank white screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In production, you'd send this to Sentry/LogRocket
    console.error("[ErrorBoundary] Caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center px-6"
          style={{ backgroundColor: "var(--color-bg)" }}
        >
          <div className="max-w-lg w-full text-center">
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl"
              style={{
                backgroundColor: "var(--color-surface-alt)",
                border: "1px solid var(--color-border)",
              }}
            >
              ⚠️
            </div>

            {/* Title */}
            <h1
              className="text-2xl font-semibold mb-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              Something went wrong
            </h1>

            {/* Description */}
            <p
              className="text-sm mb-8 leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              An unexpected error occurred while rendering this page.
              Please try refreshing, or navigate back to safety.
            </p>

            {/* Error details (development only) */}
            {import.meta.env.DEV && this.state.error && (
              <details
                className="mb-8 text-left rounded-lg p-4 text-xs overflow-auto max-h-40"
                style={{
                  backgroundColor: "var(--color-surface-alt)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-secondary)",
                }}
              >
                <summary className="cursor-pointer font-medium mb-2" style={{ color: "var(--color-saffron)" }}>
                  Error Details (dev only)
                </summary>
                <pre className="whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  this.handleReset();
                  window.location.reload();
                }}
                className="btn-primary"
              >
                Refresh Page
              </button>
              <Link to="/home" className="btn-secondary" onClick={this.handleReset}>
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
