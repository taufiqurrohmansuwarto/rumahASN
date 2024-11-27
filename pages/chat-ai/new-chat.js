"use client";
import ChatBotLayout from "@/components/AI/ChatBot/ChatBotLayout";
import AntDChatBot from "@/components/AI/AntDChatBot";
import Head from "next/head";

const ChatAINew = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Bestie AI BKD</title>
      </Head>
      <AntDChatBot />
    </>
  );
};

ChatAINew.getLayout = (page) => {
  return <ChatBotLayout active="/chat-ai">{page}</ChatBotLayout>;
};

ChatAINew.Auth = {
  action: "manage",
  subject: "tickets",
};

export default ChatAINew;
