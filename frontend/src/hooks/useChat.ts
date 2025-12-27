import { useState, useEffect } from 'react';

export type ChatMessage = {
  from: 'bot' | 'user';
  text: string;
};

type ChatResponse = {
  message: string;
  function_called?: string | null;
};

type ChatError = {
  detail: string;
};

type SuggestionsResponse = {
  suggestions: string[];
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: 'bot', text: 'Hi! Ask me about your health data from last week.' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Load suggestions on mount
  useEffect(() => {
    fetch('/api/chat/suggestions', {
      credentials: 'include',
    })
      .then((r) => {
        if (r.ok) return r.json() as Promise<SuggestionsResponse>;
        throw new Error('Failed to load suggestions');
      })
      .then((data) => {
        setSuggestions(data.suggestions);
      })
      .catch((e) => {
        console.error('Failed to load suggestions:', e);
        // Fallback suggestions
        setSuggestions([
          'How much sleep did I get last week?',
          'What was my average step count last week?',
          'How many calories did I eat last week?',
        ]);
      });
  }, []);

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Add user message immediately
    const userMsg: ChatMessage = { from: 'user', text: userMessage };
    setMessages((prev) => [...prev, userMsg]);
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ChatError;
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = (await response.json()) as ChatResponse;

      // Add bot response
      const botMsg: ChatMessage = {
        from: 'bot',
        text: data.message,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      let errorMessage = 'Failed to send message';
      
      if (e instanceof Error) {
        const errStr = e.message.toLowerCase();
        
        // Map technical errors to user-friendly messages
        if (errStr.includes('429') || errStr.includes('quota') || errStr.includes('resource_exhausted')) {
          errorMessage = "The chatbot is currently experiencing high demand. Please try again in a moment.";
        } else if (errStr.includes('401') || errStr.includes('unauthorized')) {
          errorMessage = "Your session may have expired. Please try logging in again.";
        } else if (errStr.includes('500') || errStr.includes('internal server')) {
          errorMessage = "Something went wrong on our end. Please try again.";
        } else if (errStr.includes('network') || errStr.includes('fetch')) {
          errorMessage = "Unable to connect. Please check your internet connection.";
        } else {
          errorMessage = e.message;
        }
      }
      
      setError(errorMessage);
      
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          from: 'bot',
          text: `Sorry, ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([
      { from: 'bot', text: 'Hi! Ask me about your health data from last week.' },
    ]);
    setError(null);
  };

  return {
    messages,
    loading,
    error,
    suggestions,
    sendMessage,
    clearMessages,
  };
}