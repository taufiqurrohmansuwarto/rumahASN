import { Typography } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import NewChat from "./NewChat";
import { useStyles } from "./styles";
import ThreadChat from "./ThreadChat";

const { Text } = Typography;

const ChatContainer = ({ messages, onSendMessage }) => {
  const { styles } = useStyles();
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();
  const assistantId = router.query?.assistantId;
  const threadId = router.query?.threadId;

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!threadId) {
    return <NewChat assistantId={assistantId} />;
  }

  return <ThreadChat assistantId={assistantId} threadId={threadId} />;
};

export default ChatContainer;
