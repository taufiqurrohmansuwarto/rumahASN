"use client";
import React from "react";

import AntDChatBot from "@/components/AI/AntDChatBot";
import PageContainer from "@/components/PageContainer";
import { Card } from "antd";
import Head from "next/head";

const ChatAI = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Coaching Clinic</title>
      </Head>
      <PageContainer
        title="Coaching Clinic"
        content="Daftar Coaching Clinic Saya"
      >
        <Card>
          <AntDChatBot />
        </Card>
      </PageContainer>
    </>
  );
};

ChatAI.Auth = {
  action: "manage",
  subject: "tickets",
};

export default ChatAI;
