"use client";
import ChatBotLayout from "@/components/AI/ChatBot/ChatBotLayout";
import Head from "next/head";
import AntDChatLayoutContainer from "@/components/AI/ChatBot/AntdChatLayoutContainer";
import AntdNewChat from "@/components/AI/ChatBot/AntdNewChat";
import { useSession } from "next-auth/react";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";

const ChatAI = () => {
  const { data } = useSession();
  const asn =
    data?.user?.status_kepegawaian === "PNS" ||
    data?.user?.status_kepegawaian === "PPPK" ||
    data?.user?.status_kepegawaian === "CPNS" ||
    data?.user?.status_kepegawaian === "PPPK PARUH WAKTU";

  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - Bestie AI BKD</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
      >
        <AntDChatLayoutContainer>
          {asn ? <AntdNewChat /> : null}
        </AntDChatLayoutContainer>
      </PageContainer>
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
