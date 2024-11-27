"use client";
import ChatBotLayout from "@/components/AI/ChatBot/ChatBotLayout";
import Head from "next/head";
import AntDChatLayoutContainer from "@/components/AI/ChatBot/AntdChatLayoutContainer";
import AntdNewChat from "@/components/AI/ChatBot/AntdNewChat";

const ChatAI = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Bestie AI BKD</title>
      </Head>
      <AntDChatLayoutContainer>
        <AntdNewChat />
      </AntDChatLayoutContainer>
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
