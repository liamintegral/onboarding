import React, { useState, useRef, useEffect } from 'react';

function AIChat({ platform, context, isOpen, onToggle }) {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      message: `Hi! I'm here to help you set up access for your ${platform || 'website'}. What can I assist you with?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      type: 'user',
      message: message.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: message.trim(),
          context,
          platform
        })
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage = {
          type: 'ai',
          message: data.response.message,
          suggestedActions: data.response.suggestedActions || [],
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      const errorMessage = {
        type: 'ai',
        message: 'Sorry, I encountered an error. Please try again or contact support if the issue persists.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestedAction = (action) => {
    sendMessage(action);
  };

  if (!isOpen) {
    return (
      <div
        onClick={onToggle}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          fontSize: '1.5rem',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        🤖
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      width: '400px',
      height: '600px',
      background: 'white',
      borderRadius: '15px',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🤖</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>AI Assistant</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>
              {platform} Setup Help
            </p>
          </div>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            opacity: 0.8
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map((msg, index) => (
          <div key={index}>
            <div style={{
              display: 'flex',
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                maxWidth: '80%',
                padding: '0.75rem',
                borderRadius: '10px',
                background: msg.type === 'user' ? '#667eea' : '#f7fafc',
                color: msg.type === 'user' ? 'white' : '#2d3748',
                whiteSpace: 'pre-line',
                fontSize: '0.875rem',
                lineHeight: '1.4'
              }}>
                {msg.message}
              </div>
            </div>

            {/* Suggested Actions */}
            {msg.suggestedActions && msg.suggestedActions.length > 0 && (
              <div style={{
                marginTop: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}>
                {msg.suggestedActions.map((action, actionIndex) => (
                  <button
                    key={actionIndex}
                    onClick={() => handleSuggestedAction(action)}
                    style={{
                      background: 'none',
                      border: '1px solid #e2e8f0',
                      borderRadius: '20px',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.75rem',
                      color: '#667eea',
                      cursor: 'pointer',
                      alignSelf: 'flex-start',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#667eea';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'none';
                      e.target.style.color = '#667eea';
                    }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Timestamp */}
            <div style={{
              fontSize: '0.625rem',
              color: '#a0aec0',
              marginTop: '0.25rem',
              textAlign: msg.type === 'user' ? 'right' : 'left'
            }}>
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              background: '#f7fafc',
              padding: '0.75rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#667eea',
                borderRadius: '50%',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}></div>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#667eea',
                borderRadius: '50%',
                animation: 'pulse 1.5s ease-in-out infinite 0.2s'
              }}></div>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#667eea',
                borderRadius: '50%',
                animation: 'pulse 1.5s ease-in-out infinite 0.4s'
              }}></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        gap: '0.5rem'
      }}>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about the setup process..."
          rows={2}
          style={{
            flex: 1,
            resize: 'none',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.5rem',
            fontSize: '0.875rem',
            outline: 'none'
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !inputMessage.trim()}
          style={{
            background: loading || !inputMessage.trim() ? '#a0aec0' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            cursor: loading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Send
        </button>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 80%, 100% {
            opacity: 0.3;
          }
          40% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default AIChat;