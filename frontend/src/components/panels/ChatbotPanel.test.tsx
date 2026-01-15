import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ChatbotPanel from './ChatbotPanel';
import * as useChatHook from '../../hooks/useChat';

vi.mock('../../hooks/useChat');

describe('ChatbotPanel', () => {
  const mockSendMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    Storage.prototype.getItem = vi.fn(() => 'mock-token');

    vi.spyOn(useChatHook, 'useChat').mockReturnValue({
      messages: [],
      loading: false,
      sendMessage: mockSendMessage,
      error: null,
      suggestions: [],
      clearMessages: vi.fn(),
    });

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            suggestions: ['Check Heart Rate', 'Sleep Analysis'],
          }),
      }),
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the empty state correctly', () => {
    render(<ChatbotPanel />);
    expect(
      screen.getByText("I'm here to help analyze your health data."),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Ask about your health data...'),
    ).toBeInTheDocument();
  });

  it('renders messages when provided', () => {
    vi.spyOn(useChatHook, 'useChat').mockReturnValue({
      messages: [
        { from: 'user', text: 'Hello' },
        { from: 'bot', text: 'Hi there!' },
      ],
      loading: false,
      sendMessage: mockSendMessage,
      error: null,
      suggestions: [],
      clearMessages: vi.fn(),
    });

    render(<ChatbotPanel />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
    expect(
      screen.queryByText("I'm here to help analyze your health data."),
    ).not.toBeInTheDocument();
  });

  it('calls sendMessage when input is submitted', async () => {
    const user = userEvent.setup();
    render(<ChatbotPanel />);

    const input = screen.getByPlaceholderText('Ask about your health data...');
    const sendButton = screen.getByText('Send');

    await user.type(input, 'My symptoms');
    await user.click(sendButton);

    expect(mockSendMessage).toHaveBeenCalledWith('My symptoms');
    expect(input).toHaveValue('');
  });

  it('fetches and displays suggestions', async () => {
    render(<ChatbotPanel />);

    const suggestionBtn = await screen.findByText('Check Heart Rate');
    expect(suggestionBtn).toBeInTheDocument();
  });
});
