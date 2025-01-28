"use client";
import AntDChatLayoutContainer from "@/components/AI/ChatBot/AntdChatLayoutContainer";
import AntdChatMessagesNew from "@/components/AI/ChatBot/AntdChatMesssagesNew";
import AntdChatSenderNew from "@/components/AI/ChatBot/AntdChatSenderNew";
import useStyle from "@/components/AI/ChatBot/AntdChatStyle";
import ChatBotLayout from "@/components/AI/ChatBot/ChatBotLayout";
import PageContainer from "@/components/PageContainer";
import { useAssistant } from "ai/react";
import { Card, Col, Grid, Row } from "antd";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

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

  const breakPoint = Grid.useBreakpoint();
  const HEIGHT_CHAT = "120px";

  const height = breakPoint?.xs ? "90vh" : `calc(100vh - ${HEIGHT_CHAT})`;

  // Fungsi untuk scroll ke bawah
  const scrollToBottom = (element) => {
    if (element) {
      setTimeout(() => {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Bestie AI BKD</title>
      </Head>
      {asn ? (
        <PageContainer
          childrenContentStyle={{
            padding: breakPoint?.xs ? 0 : null,
          }}
        >
          <AntDChatLayoutContainer>
            <Card
              style={{
                height: height,
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                scrollBehavior: "smooth",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(0,0,0,0.2) transparent",
              }}
              ref={scrollToBottom}
            >
              <Row justify="center">
                <Col md={14} xs={24}>
                  <AntdChatMessagesNew
                    status={status}
                    setMessages={setMessages}
                    messages={messages}
                    style={styles}
                  />
                  <div
                    style={{
                      position: "sticky",
                      bottom: "20px",
                      backgroundColor: "#fff",
                      zIndex: 1,
                      marginTop: "10px",
                    }}
                  >
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
                  </div>
                </Col>
              </Row>
            </Card>
          </AntDChatLayoutContainer>
        </PageContainer>
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
