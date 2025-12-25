
import React, { Suspense, Component, ErrorInfo, ReactNode } from 'react';
import Scene from './components/Scene';
import UI from './components/UI';

// Define Props interface to fix "Property 'children' is missing" error in JSX usage (Line 31)
interface ErrorBoundaryProps {
  children?: ReactNode;
}

// Define State interface to ensure the compiler recognizes the 'state' property (Lines 9 and 14)
interface ErrorBoundaryState {
  hasError: boolean;
}

// Extending Component with explicit interfaces to resolve inheritance-related property errors
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // Initializing state to resolve "Property 'state' does not exist" error (Line 9)
    this.state = { hasError: false };
  }

  // Implementing getDerivedStateFromError with correct typing
  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging purposes
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    // Accessing this.state which is now properly defined by the generic State type (Line 14)
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-white/60 mb-8">The magic crystal seems to have cracked. Try refreshing the page.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-all">
            Refresh
          </button>
        </div>
      );
    }
    // Correctly returning this.props.children which is now properly typed (Line 25)
    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    // Fixed: JSX now correctly recognizes ErrorBoundary and its children (Line 31)
    <ErrorBoundary>
      <UI />
      <Suspense fallback={
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white font-mono z-50">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
          <div className="text-sm tracking-widest animate-pulse">INITIATING WINTER MAGIC...</div>
        </div>
      }>
        <Scene />
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
