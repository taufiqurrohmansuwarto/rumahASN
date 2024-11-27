import Sender from "../Sender";

function ChatSenderWelcome({ send, loading }) {
  const handleSubmit = (message) => {
    send({ threadId: null, message });
  };

  return <Sender loading={loading} onSubmit={handleSubmit} />;
}

export default ChatSenderWelcome;
