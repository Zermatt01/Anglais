import { Component, type ReactNode } from 'react';
import { Button } from '../ui/Button.tsx';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly failed: boolean;
}

/**
 * Last line of defence: an unexpected error shows a clear, actionable screen
 * instead of a blank page (UI-03). Drafts are saved when the screens unmount.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  override componentDidCatch(error: unknown): void {
    // Name and message only: never the learner's data (SEC-03).
    const description = error instanceof Error ? `${error.name}: ${error.message}` : 'unknown';
    console.error('Unexpected error:', description);
  }

  override render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="boot-screen">
        <h1>Une erreur inattendue est survenue</h1>
        <p>
          Tes données sont enregistrées sur ce téléphone. Recharge l’application pour continuer.
        </p>
        <div className="button-row">
          <Button
            onClick={() => {
              window.location.reload();
            }}
          >
            Recharger l’application
          </Button>
        </div>
      </main>
    );
  }
}
