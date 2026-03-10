import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-6">🍽️</div>
            <h1 className="text-2xl font-semibold text-white mb-3 tracking-tight">
              Something went wrong
            </h1>
            <p className="text-white/50 mb-8 font-medium">
              We hit an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="backdrop-blur-xl bg-white hover:bg-white/90 text-black px-6 py-3 rounded-2xl font-bold transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
