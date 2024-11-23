"use client";

import AntDChatBot from "@/components/AI/AntDChatBot";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const ChatAI = () => {
  return (
    <>
      <Head>
        <title>Chat AI</title>
      </Head>
      <PageContainer
        title="Chat AI"
        content="Artificial Intelligence untuk Pelayanan yang Responsif, Inovatif, Modern dan Akuntabel"
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
