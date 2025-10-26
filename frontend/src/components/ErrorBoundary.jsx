import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You can log the error to an error reporting service here
    // console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-2xl text-center">
            <h1 className="text-3xl font-bold mb-4">Une erreur est survenue</h1>
            <p className="text-gray-300 mb-4">Désolé, quelque chose a empêché l'affichage de cette page.</p>
            <pre className="text-xs text-left bg-dark-200 p-4 rounded overflow-auto">{String(this.state.error)}</pre>
            <p className="text-sm text-gray-400 mt-4">Vérifiez la console pour plus de détails.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
