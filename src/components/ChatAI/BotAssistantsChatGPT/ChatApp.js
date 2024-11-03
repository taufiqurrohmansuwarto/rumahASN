import React, { useState } from "react";
import { Flex, Layout, ConfigProvider, Spin, message } from "antd";
import { ChatHistory } from "./ChatHistory";
import { AssistantSelector } from "./AssistantSelector";
import { ChatContainer } from "./ChatContainer";
import { NewChat } from "./NewChat";
import { AssistantAIServices } from "@/services/assistant-ai.services";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const { Sider, Content } = Layout;

const globalStyles = {
  "*": {
    "&::-webkit-scrollbar": {
      width: "6px",
      height: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
      borderRadius: "4px",
      margin: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "rgba(0, 0, 0, 0.2)",
      borderRadius: "4px",
      "&:hover": {
        background: "rgba(0, 0, 0, 0.3)",
      },
    },
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(0, 0, 0, 0.2) transparent",
  },
};

const ChatApp = ({ height = "100vh" }) => {
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useState(false);
  const [currentAssistant, setCurrentAssistant] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [firstMessage, setFirstMessage] = useState(null);

  // Fetch assistants
  const { data: assistants, isLoading: isLoadingAssistants } = useQuery(
    ["assistants"],
    AssistantAIServices.getAssistants,
    {
      staleTime: 5 * 60 * 1000,
      onSuccess: (data) => {
        // Auto select first assistant if none selected
        if (data?.length > 0 && !currentAssistant) {
          setCurrentAssistant(data[0].id);
        }
      },
    }
  );

  // Fetch threads for current assistant
  const { data: threads, isLoading: isLoadingThreads } = useQuery(
    ["threads", currentAssistant],
    () => AssistantAIServices.getThreads(currentAssistant),
    {
      enabled: !!currentAssistant,
      staleTime: 3000, // Refresh every 3 seconds
    }
  );

  const handleAssistantChange = (assistantId) => {
    setCurrentAssistant(assistantId);
    setActiveThread(null);
    setFirstMessage(null);
  };

  const handleStartChat = (threadData) => {
    try {
      const { id, firstMessage: initialMessage } = threadData;
      setActiveThread({ id });
      setFirstMessage(initialMessage);
      // Prefetch messages for the new thread
      queryClient.prefetchQuery(["messages", currentAssistant, id], () =>
        AssistantAIServices.getThreadMessages({
          assistantId: currentAssistant,
          threadId: id,
        })
      );
    } catch (error) {
      message.error("Failed to start new chat");
      console.error("Error starting chat:", error);
    }
  };

  const handleSelectThread = (thread) => {
    setActiveThread(thread);
    setFirstMessage(null);
  };

  const handleNewChat = () => {
    setActiveThread(null);
    setFirstMessage(null);
  };

  const contentHeight = `calc(${height} - 64px)`;
  const isLoading =
    isLoadingAssistants || (currentAssistant && isLoadingThreads);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 8,
        },
        components: {
          Layout: {
            bodyStyle: globalStyles,
          },
        },
      }}
    >
      <Flex style={{ height, overflow: "hidden" }}>
        <Layout style={{ height }} hasSider>
          <Sider
            width={300}
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            breakpoint="lg"
            collapsedWidth={0}
            style={{
              background: "#ffffff",
              borderRight: "1px solid #f0f0f0",
              overflow: "hidden",
              height,
            }}
          >
            <ChatHistory
              assistantId={currentAssistant}
              activeThread={activeThread}
              onSelectThread={handleSelectThread}
              onNewChat={handleNewChat}
              loading={isLoading}
            />
          </Sider>

          <Layout
            style={{
              height,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <AssistantSelector
              collapsed={collapsed}
              onCollapse={setCollapsed}
              currentAssistant={currentAssistant}
              onAssistantChange={handleAssistantChange}
              loading={isLoadingAssistants}
            />

            <Content
              style={{
                height: contentHeight,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {isLoading ? (
                <Flex
                  align="center"
                  justify="center"
                  style={{ height: "100%" }}
                >
                  <Spin size="large" />
                </Flex>
              ) : activeThread ? (
                <ChatContainer
                  assistantId={currentAssistant}
                  threadId={activeThread.id}
                  firstMessage={firstMessage}
                  key={activeThread.id} // Force remount on thread change
                />
              ) : (
                <NewChat
                  onStartChat={handleStartChat}
                  assistantId={currentAssistant}
                />
              )}
            </Content>
          </Layout>
        </Layout>
      </Flex>
    </ConfigProvider>
  );
};

export default ChatApp;
