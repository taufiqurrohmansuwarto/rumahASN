"use client";

import AntDChatLayoutContainer from "@/components/AI/ChatBot/AntdChatLayoutContainer";
import AntdChatMessagesNew from "@/components/AI/ChatBot/AntdChatMesssagesNew";
import AntdChatSenderNew from "@/components/AI/ChatBot/AntdChatSenderNew";
import useStyle from "@/components/AI/ChatBot/AntdChatStyle";
import ChatBotLayout from "@/components/AI/ChatBot/ChatBotLayout";
import { useAssistant } from "ai/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const ChatAIThread = () => {
  const { styles } = useStyle();
  const router = useRouter();
  const { threadId: currentThreadId } = router.query;

  const { data } = useSession();
  const asn =
    data?.user?.status_kepegawaian === "PNS" ||
    data?.user?.status_kepegawaian === "PPPK";

  const {
    status,
    messages,
    input,
    setMessages,
    setThreadId,
    threadId,
    append,
    error,
    setInput,
    submitMessage,
    stop,
    handleInputChange,
  } = useAssistant({
    api: "/helpdesk/api/assistant/test",
    threadId: currentThreadId,
  });

  return (
    <>
      <Head>
        <title>Rumah ASN - Bestie AI BKD</title>
      </Head>
      {asn ? (
        <AntDChatLayoutContainer>
          <AntdChatMessagesNew
            status={status}
            setMessages={setMessages}
            messages={messages}
            style={styles}
          />
          <AntdChatSenderNew
            style={styles}
            status={status}
            submitMessage={submitMessage}
            stop={stop}
            append={append}
            setInput={setInput}
            input={input}
            handleInputChange={handleInputChange}
          />
        </AntDChatLayoutContainer>
      ) : null}
    </>
  );
};

ChatAIThread.getLayout = (page) => {
  return <ChatBotLayout active="/chat-ai">{page}</ChatBotLayout>;
};

ChatAIThread.Auth = {
  action: "manage",
  subject: "tickets",
};

export default ChatAIThread;
