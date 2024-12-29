"use client";
import ChatBotLayout from "@/components/AI/ChatBot/ChatBotLayout";
import Head from "next/head";
import AntDChatLayoutContainer from "@/components/AI/ChatBot/AntdChatLayoutContainer";
import AntdNewChat from "@/components/AI/ChatBot/AntdNewChat";
import { useSession } from "next-auth/react";

const ChatAI = () => {
  const { data } = useSession();
  const asn =
    data?.user?.status_kepegawaian === "PNS" ||
    data?.user?.status_kepegawaian === "PPPK";

  return (
    <>
      <Head>
        <title>Rumah ASN - Bestie AI BKD</title>
      </Head>
      <AntDChatLayoutContainer>
        {asn ? <AntdNewChat /> : null}
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
