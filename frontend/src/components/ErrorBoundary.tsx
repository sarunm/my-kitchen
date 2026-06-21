'use client';

import React, { ReactNode, useState } from 'react';

interface Props {
  children: ReactNode;
}

export function ErrorBoundary({ children }: Props) {
  const [error, setError] = useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Caught error:', event.error);
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    return (
      <div style={{ padding: '1rem', backgroundColor: '#ffebee', color: '#c62828' }}>
        <h3>Component Error</h3>
        <p>{error.message}</p>
        <pre>{error.stack}</pre>
        <button onClick={() => setError(null)}>Dismiss</button>
      </div>
    );
  }

  return <>{children}</>;
}
