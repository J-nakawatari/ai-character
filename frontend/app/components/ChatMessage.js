export default function ChatMessage({ message, isUser }) {
  return (
    <div className={`chat-message ${isUser ? 'chat-message-user' : 'chat-message-ai'}`}>
      <div className="chat-message-bubble">
        <p className="chat-message-content">{message.content}</p>
        <span className="chat-message-time">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
