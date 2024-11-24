"use client";
import ChatBotLayout from "@/components/AI/ChatBot/ChatBotLayout";
import AntDChatBot from "@/components/AI/AntDChatBot";
import Head from "next/head";

const ChatAI = () => {
  return (
    <>
      <Head>
        <title>BESTIE AI BKD</title>
      </Head>
      <AntDChatBot />
    </>
  );
};

ChatAI.getLayout = (page) => {
  return <ChatBotLayout active="/chat-ai">{page}</ChatBotLayout>;
};

ChatAI.Auth = {
  action: "manage",
  subject: "tickets",
};

export default ChatAI;
