import { useState } from "react";
import Sender from "../Sender";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

function AntdChatSenderNew({
  style,
  status,
  submitMessage,
  stop,
  setInput,
  input,
  append,
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");

  useEffect(() => {
    if (status === "awaiting_message") {
      queryClient.invalidateQueries({
        queryKey: ["chat-messages", router?.query?.threadId],
      });
    }
  }, [status, router?.query?.threadId, queryClient]);

  const handleChangeText = (e) => {
    setText(e);
  };

  const handleSubmit = async () => {
    append({
      role: "user",
      content: text,
    });
    await submitMessage();
    setText("");
  };

  return (
    <Sender
      loading={status !== "awaiting_message"}
      placeholder="Tanya BestieAI"
      onSubmit={handleSubmit}
      value={text}
      onChange={handleChangeText}
      onCancel={stop}
    />
  );
}

export default AntdChatSenderNew;
