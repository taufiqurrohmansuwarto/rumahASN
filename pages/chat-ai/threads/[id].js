"use client";
import ChatBotLayout from "@/components/AI/ChatBot/ChatBotLayout";
import AntDChatBot from "@/components/AI/AntDChatBot";
import Head from "next/head";

const ChatAIThread = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Bestie AI BKD</title>
      </Head>
      <AntDChatBot />
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
