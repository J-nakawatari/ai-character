import Image from 'next/image';

export default function ChatMessage({ message, isUser, characterImageUrl }) {
  const formattedContent = message.content.split('\n').map((text, i) => (
    <span key={i}>
      {text}
      {i < message.content.split('\n').length - 1 && <br />}
    </span>
  ));

  return (
    <div className={`chat-message ${isUser ? 'chat-message-user' : 'chat-message-ai'}`}>
      {!isUser && characterImageUrl && (
        <div className="chat-message-avatar">
          <Image src={characterImageUrl} alt="Character" width={40} height={40} className="chat-avatar-img" />
        </div>
      )}
      <div className="chat-message-bubble">
        <p className="chat-message-content">{formattedContent}</p>
        <span className="chat-message-time">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
