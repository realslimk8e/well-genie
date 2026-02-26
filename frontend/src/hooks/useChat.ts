import { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import { apiClient } from '../lib/apiClient';

export type ChatMessage = {
  from: 'bot' | 'user';
  text: string;
};

type ChatResponse = {
  message: string;
  function_called?: string | null;
};

type ApiDetailError = {
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
    apiClient
      .get<SuggestionsResponse>('/api/chat/suggestions')
      .then((response) => {
        setSuggestions(response.data.suggestions);
      })
      .catch((e) => {
        console.error('Failed to load suggestions:', e);
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
      const response = await apiClient.post<ChatResponse>('/api/chat', {
        message: userMessage,
      });
      const data = response.data;

      // Add bot response
      const botMsg: ChatMessage = {
        from: 'bot',
        text: data.message,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e: unknown) {
      let errorMessage = 'Failed to send message';

      if (isAxiosError(e)) {
        const status = e.response?.status;
        const detail = (e.response?.data as ApiDetailError | undefined)?.detail;
        const errText = `${status ?? ''} ${detail ?? e.message}`.toLowerCase();

        if (
          errText.includes('429') ||
          errText.includes('quota') ||
          errText.includes('resource_exhausted')
        ) {
          errorMessage = "The chatbot is currently experiencing high demand. Please try again in a moment.";
        } else if (errText.includes('401') || errText.includes('unauthorized')) {
          errorMessage = "Your session may have expired. Please try logging in again.";
        } else if (errText.includes('500') || errText.includes('internal server')) {
          errorMessage = "Something went wrong on our end. Please try again.";
        } else if (errText.includes('network')) {
          errorMessage = "Unable to connect. Please check your internet connection.";
        } else {
          errorMessage = detail || e.message;
        }
      } else if (e instanceof Error) {
        errorMessage = e.message;
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
