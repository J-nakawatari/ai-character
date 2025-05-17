import Image from 'next/image';

export default function ChatMessage({ message, isUser, characterImageUrl }) {
  return (
    <div className={`chat-message ${isUser ? 'chat-message-user' : 'chat-message-ai'}`}>
      {!isUser && characterImageUrl && (
        <div className="chat-message-avatar">
          <Image src={characterImageUrl} alt="Character" width={40} height={40} className="chat-avatar-img" />
        </div>
      )}
      <div className="chat-message-bubble">
        <p className="chat-message-content">{message.content}</p>
        <span className="chat-message-time">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {isUser && (
        <div className="chat-message-avatar chat-message-avatar-user">
          <div className="chat-avatar-user-icon">
            {message.sender === 'user' ? message.content.charAt(0).toUpperCase() : '?'}
          </div>
        </div>
      )}
    </div>
  );
}
