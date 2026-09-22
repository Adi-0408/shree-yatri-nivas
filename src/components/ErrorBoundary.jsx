import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Shree Yatri Nivas - Uncaught UI Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#FDFBF7'
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(128, 0, 32, 0.08)',
            border: '1px solid #E6DCCD'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#FEF2F2',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              marginBottom: '1.25rem',
              border: '2px solid #FCA5A5'
            }}>
              🛕
            </div>
            
            <h2 style={{
              color: '#800020',
              fontSize: '1.4rem',
              fontWeight: 800,
              marginBottom: '0.6rem',
              fontFamily: "'Cinzel', serif"
            }}>
              Shree Yatri Nivas
            </h2>

            <p style={{ color: '#4A5568', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              We encountered a minor display hiccup while loading this section. Please reload or return to the main portal.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.7rem 1.4rem',
                  backgroundColor: '#800020',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.7rem 1.4rem',
                  backgroundColor: 'transparent',
                  color: '#800020',
                  border: '1.5px solid #800020',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Return to Home
              </button>
            </div>

            {this.state.error && (
              <details style={{ marginTop: '1.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#718096' }}>
                <summary style={{ cursor: 'pointer', outline: 'none' }}>Technical Diagnostic Info</summary>
                <pre style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#F7FAFC',
                  borderRadius: '6px',
                  overflowX: 'auto',
                  border: '1px solid #E2E8F0',
                  color: '#E53E3E'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
