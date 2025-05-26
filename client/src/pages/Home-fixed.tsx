import React, { useState, useEffect } from 'react';
import { LogIn, FileText, ArrowRight, Zap, Layers, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthHook';

interface SystemStatus {
  version: string;
  uptime: number;
  transport: string;
  wsEnabled: boolean;
  environment: string;
  features: Record<string, boolean>;
}

export default function Home() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/status');
      if (response.ok) {
        const status = await response.json();
        setSystemStatus(status);
      }
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: 'white'
    }}>
      {/* Navigation */}
      <nav style={{
        padding: '1rem 2rem',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            margin: 0
          }}>
            MCP Integration Platform
          </h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="/auth" style={{
              color: 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '0.25rem',
              fontWeight: '500'
            }}>
              Sign In
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '6rem 2rem',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '4rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          background: 'linear-gradient(to right, #ffffff, #e0e7ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: '1.1'
        }}>
          MCP Integration Platform
        </h1>
        
        <p style={{
          fontSize: '1.5rem',
          marginBottom: '1rem',
          opacity: 0.9
        }}>
          AI Service Integration Framework
        </p>
        
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '3rem',
          opacity: 0.8,
          maxWidth: '600px',
          margin: '0 auto 3rem'
        }}>
          Our MCP Integration Platform provides multiple tools to enhance your AI applications with powerful capabilities.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '4rem'
        }}>
          <a href="/auth" style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '1rem 2rem',
            background: 'linear-gradient(to right, #8b5cf6, #3b82f6)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: 'none'
          }}>
            <LogIn style={{ marginRight: '0.5rem', width: '1.25rem', height: '1.25rem' }} />
            Sign In / Register
          </a>
          
          <a href="/documentation" style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '1rem 2rem',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            transition: 'background 0.2s'
          }}>
            <FileText style={{ marginRight: '0.5rem', width: '1.25rem', height: '1.25rem' }} />
            Documentation
          </a>
          
          <a href="/api-docs" style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '1rem 2rem',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            transition: 'background 0.2s'
          }}>
            <ArrowRight style={{ marginRight: '0.5rem', width: '1.25rem', height: '1.25rem' }} />
            Get Started
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '4rem 2rem',
        background: 'rgba(255, 255, 255, 0.95)',
        color: '#1f2937'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '2rem',
            background: 'linear-gradient(to right, #8b5cf6, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Key Features
          </h2>
          
          <p style={{
            fontSize: '1.2rem',
            color: '#6b7280',
            marginBottom: '3rem',
            maxWidth: '600px',
            margin: '0 auto 3rem'
          }}>
            Our MCP Integration Platform provides multiple tools to enhance your AI applications with powerful capabilities.
          </p>

          {/* Feature Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            {/* Feature Card 1 */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb',
              textAlign: 'left',
              transition: 'transform 0.3s, box-shadow 0.3s'
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Zap style={{ color: 'white', width: '1.5rem', height: '1.5rem' }} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: '#1f2937'
              }}>
                Web Search
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                Search the web with multiple provider options including Tavily, Perplexity, and OpenAI for comprehensive results.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb',
              textAlign: 'left',
              transition: 'transform 0.3s, box-shadow 0.3s'
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Layers style={{ color: 'white', width: '1.5rem', height: '1.5rem' }} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: '#1f2937'
              }}>
                Form Automation
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                Fill and submit web forms programmatically with intelligent field detection and validation.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb',
              textAlign: 'left',
              transition: 'transform 0.3s, box-shadow 0.3s'
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Search style={{ color: 'white', width: '1.5rem', height: '1.5rem' }} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: '#1f2937'
              }}>
                Vector Storage
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                Connect to vector databases like Pinecone and Weaviate for semantic search and retrieval.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Status Section */}
      {systemStatus && (
        <section style={{
          padding: '2rem',
          background: 'rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              System Status
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                <div style={{ fontWeight: 'bold' }}>Version</div>
                <div>{systemStatus.version}</div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                <div style={{ fontWeight: 'bold' }}>Environment</div>
                <div>{systemStatus.environment}</div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                <div style={{ fontWeight: 'bold' }}>WebSocket</div>
                <div>{systemStatus.wsEnabled ? '✓ Enabled' : '✗ Disabled'}</div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}