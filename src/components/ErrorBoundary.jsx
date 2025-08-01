import React from 'react';
import MaintenanceModal from './MaintenanceModal.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
    // opcional: enviar a Sentry, LogRocket, etc.
  }

  render() {
    if (this.state.hasError) {
      return <MaintenanceModal />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
