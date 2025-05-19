import Image from 'next/image';

export default function ChatMessage({ message, isUser, characterImageUrl }) {
  const formattedContent = message.content.split('\n').map((text, i) => (
    <span key={i}>
      {text}
      {i < message.content.split('\n').length - 1 && <br />}
    </span>
  ));

  const messageClass = isUser ? 'chat-message--user' : 'chat-message--ai';

  return (
    <div className={`chat-message ${messageClass}`}>
      {!isUser && characterImageUrl && (
        <div className="chat-message__avatar">
          <Image 
            src={characterImageUrl} 
            alt="Character" 
            width={40} 
            height={40} 
            className="chat-message__avatar-img" 
          />
        </div>
      )}
      <div className="chat-message__bubble">
        <p className="chat-message__content">{formattedContent}</p>
        <span className="chat-message__time">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
