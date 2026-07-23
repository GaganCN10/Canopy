import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    console.error('Uncaught error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-canopy-sand-50 p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-display font-semibold text-canopy-forest-950 mb-2">
              Something went wrong
            </h1>
            <p className="text-canopy-ink-900/70 mb-6">
              We encountered an unexpected error. Please try reloading the page or go back to the home page.
            </p>
            {this.state.error && (
              <p className="text-xs text-canopy-ink-900/50 mb-6 font-mono bg-canopy-sand-100 rounded-lg p-3 text-left overflow-auto max-h-32">
                {this.state.error.toString()}
              </p>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="btn-primary inline-flex items-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Reload Page
              </button>
              <Link to="/" className="btn-secondary inline-flex items-center gap-2">
                <Home className="w-4 h-4" />
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
