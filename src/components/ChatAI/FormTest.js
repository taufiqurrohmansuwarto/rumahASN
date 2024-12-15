import { UserOutlined } from "@ant-design/icons";
import { useAssistant } from "ai/react";
import { useSession } from "next-auth/react";

import BubbleList from "../AI/BubbleList";
import Sender from "../AI/Sender";
import ReactMarkdownCustom from "../MarkdownEditor/ReactMarkdownCustom";

const roles = {
  assistant: {
    placement: "start",
    avatar: {
      icon: <UserOutlined />,
      style: {
        background: "#fde3cf",
      },
    },
    style: {
      maxWidth: 600,
    },
  },
  user: {
    placement: "end",
    avatar: {
      icon: <UserOutlined />,
      style: {
        background: "#87d068",
      },
    },
  },
};

export default function FormTest() {
  const {
    status,
    messages,
    input,
    submitMessage,
    handleInputChange,
    setMessages,
    setThreadId,
    threadId,
    append,
    error,
    setInput,
    stop,
  } = useAssistant({
    api: "/helpdesk/api/assistant/test",
  });

  const handleChangeText = (e) => {
    setInput(e);
  };

  return (
    <div>
      <BubbleList
        roles={roles}
        items={
          status !== ""
            ? [
                ...messages?.map((m) => ({
                  key: m.id,
                  role: m.role,
                  content: (
                    <ReactMarkdownCustom withCustom>
                      {m.content}
                    </ReactMarkdownCustom>
                  ),
                })),
                {
                  id: Date.now(),
                  content: "Typing...",
                  role: "assistant",
                  loading: true,
                },
              ]
            : messages?.map((m) => ({
                key: m.id,
                role: m.role,
                content: (
                  <ReactMarkdownCustom withCustom>
                    {m.content}
                  </ReactMarkdownCustom>
                ),
              }))
        }
      />

      <Sender
        loading={status !== "awaiting_message"}
        onClick={submitMessage}
        value={input}
        placeholder="What is the temperature in the living room?"
        onChange={handleChangeText}
        onSubmit={submitMessage}
        onCancel={stop}
      />
    </div>
  );
}
