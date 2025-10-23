export default function ChatbotPanel() {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex-grow overflow-y-auto">
        <div className="chat chat-start">
          <div className="chat-image avatar">
            <div className="w-10 rounded-full">
              <img
                src="https://api.dicebear.com/9.x/thumbs/svg?seed=Felix"
                alt="avatar"
              />
            </div>
          </div>
          <div className="chat-header">
            Well-Genie
            <time className="ml-1 text-xs opacity-50">12:45</time>
          </div>
          <div className="chat-bubble">How can I help you today?</div>
          <div className="chat-footer opacity-50">Delivered</div>
        </div>

        {/* User's message */}
        <div className="chat chat-end">
          <div className="chat-image avatar">
            <div className="w-10 rounded-full">
              <img
                src="https://api.dicebear.com/9.x/thumbs/svg?seed=Aneka"
                alt="avatar"
              />
            </div>
          </div>
          <div className="chat-header">
            You
            <time className="ml-1 text-xs opacity-50">12:46</time>
          </div>
          <div className="chat-bubble chat-bubble-primary">
            Review my sleep data for this month
          </div>
          <div className="chat-footer opacity-50">Seen at 12:46</div>
        </div>
      </div>

      {/* Input area */}
      <div className="join mt-4">
        <input
          className="input input-bordered join-item w-full"
          placeholder="Type your message..."
        />
        <button className="btn join-item">Send</button>
      </div>
    </div>
  );
}
