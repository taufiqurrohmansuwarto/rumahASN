import AntDChatLayoutContainer from "@/components/AI/ChatBot/AntdChatLayoutContainer";
import AntdChatMessagesNew from "@/components/AI/ChatBot/AntdChatMesssagesNew";
import AntdChatSenderNew from "@/components/AI/ChatBot/AntdChatSenderNew";
import useStyle from "@/components/AI/ChatBot/AntdChatStyle";
import ChatBotLayout from "@/components/AI/ChatBot/ChatBotLayout";
import PageContainer from "@/components/PageContainer";
import { useAssistant } from "ai/react";
import { Card, Col, Grid, Row, Affix, Button } from "antd";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { DownOutlined } from "@ant-design/icons";

const ChatAIThread = () => {
  const { styles } = useStyle();
  const router = useRouter();
  const { threadId: currentThreadId } = router.query;

  const { data } = useSession();
  const asn =
    data?.user?.status_kepegawaian === "PNS" ||
    data?.user?.status_kepegawaian === "PPPK" ||
    data?.user?.status_kepegawaian === "CPNS" ||
    data?.user?.status_kepegawaian === "PPPK Paruh Waktu";

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

  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const shouldShow = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(shouldShow);
    }
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
                position: "relative",
              }}
              ref={chatContainerRef}
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
                    {showScrollButton && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: 8,
                          position: "absolute",
                          left: 0,
                          right: 0,
                          bottom: 60,
                          pointerEvents: "none",
                        }}
                      >
                        <Button
                          type="default"
                          shape="circle"
                          icon={<DownOutlined />}
                          onClick={scrollToBottom}
                          style={{
                            pointerEvents: "auto",
                          }}
                        />
                      </div>
                    )}
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
