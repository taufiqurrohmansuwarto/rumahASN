"use client";

import AntDChatBot from "@/components/AI/AntDChatBot";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import Head from "next/head";

const ChatAI = () => {
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Chat AI</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        title="Chat AI"
      >
        <AntDChatBot />
      </PageContainer>
    </>
  );
};

ChatAI.Auth = {
  action: "manage",
  subject: "tickets",
};

export default ChatAI;
