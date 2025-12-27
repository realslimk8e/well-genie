import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import { useChat } from '../../hooks/useChat';

export default function ChatbotPanel() {
  const { messages, loading, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/chat/suggestions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      }
    };

    fetchSuggestions();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = (text?: string) => {
    const messageToSend = text || input;
    if (!messageToSend.trim()) return;

    sendMessage(messageToSend);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Chat Messages */}
      <div className="bg-base-200 border-base-300 rounded-box flex-grow space-y-3 overflow-y-auto border p-4">
        {messages.length === 0 && suggestions.length === 0 && !loading && (
          <div className="hero h-full opacity-70">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <h2 className="text-2xl font-bold">WellGenie</h2>
                <p className="py-4">
                  I'm here to help analyze your health data.
                </p>
              </div>
            </div>
          </div>
        )}

        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`chat ${m.from === 'bot' ? 'chat-start' : 'chat-end'}`}
          >
            <div
              className={`chat-image avatar ${m.from === 'bot' ? '' : 'avatar-placeholder'}`}
            >
              <div
                className={`w-10 rounded-full ${m.from === 'bot' ? '' : 'bg-neutral text-neutral-content'}`}
              >
                {m.from === 'bot' ? (
                  <img src="/wellgenie.png" alt="WellGenie" />
                ) : (
                  <span>Me</span>
                )}
              </div>
            </div>
            <div className="chat-header mb-1 text-xs opacity-50">
              {m.from === 'bot' ? 'WellGenie' : 'You'}
            </div>
            <div
              className={`chat-bubble ${
                m.from === 'bot' ? 'chat-bubble-accent' : 'chat-bubble-primary'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img src="/wellgenie.png" alt="WellGenie" />
              </div>
            </div>
            <div className="chat-header mb-1 text-xs opacity-50">WellGenie</div>
            <div className="chat-bubble chat-bubble-accent">
              <span className="loading loading-dots loading-sm"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1 pb-2">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(suggestion)}
              className="badge badge-soft badge-warning"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="join w-full shadow-sm">
        <input
          className="input input-bordered join-item flex-1"
          placeholder="Ask about your health data..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          aria-label="chat input"
        />
        <button
          className="btn btn-primary join-item"
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            'Send'
          )}
        </button>
      </div>
    </div>
  );
}
