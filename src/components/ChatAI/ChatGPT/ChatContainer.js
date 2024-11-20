import { AssistantAIServices } from "@/services/assistant-ai.services";
import { useQuery } from "@tanstack/react-query";
import { Layout, List, Menu, Spin, Typography } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Messages from "./Messages";
import NewChat from "./NewChat";

const { Sider, Content } = Layout;
const { Title } = Typography;

const Container = ({ selectedAssistant, selectedThread }) => {
  if (selectedThread) {
    return <Messages />;
  } else if (selectedAssistant) {
    return <NewChat selectedAssistant={selectedAssistant} />;
  }

  return <div>No assistant or thread selected</div>;
};

function ChatContainer() {
  const router = useRouter();
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);

  const [collapsed, setCollapsed] = useState(false);

  // Get assistants list
  const { data: assistants, isLoading: loadingAssistants } = useQuery(
    ["assistants"],
    () => AssistantAIServices.getAssistants(),
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  useEffect(() => {
    const assistantId = router.query.assistantId;
    if (assistantId) {
      changeSelectedAssistant(assistantId);
    }
  }, [router.query.assistantId]);

  const changeSelectedAssistant = (assistantId) => {
    setSelectedAssistant(assistantId);
    setSelectedThread(null);
    router.push(`/asn-connect/asn-ai-chat?assistantId=${assistantId}`);
  };

  const changeSelectedThread = (threadId) => {
    setSelectedThread(threadId);

    router.push(
      `/asn-connect/asn-ai-chat?${
        selectedAssistant ? `assistantId=${selectedAssistant}&` : ""
      }threadId=${threadId}`
    );
  };

  // Get threads for selected assistant
  const { data: threads, isLoading: loadingThreads } = useQuery(
    ["threads", selectedAssistant],
    () => AssistantAIServices.getThreads(selectedAssistant),
    {
      enabled: !!selectedAssistant,
      staleTime: 1000 * 60, // 1 minute
    }
  );

  // Effect to handle URL params
  useEffect(() => {
    const { assistantId, threadId } = router.query;

    if (assistantId) {
      setSelectedAssistant(assistantId);
    }

    if (threadId) {
      setSelectedThread(threadId);
    }
  }, [router.query]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(collapsed) => setCollapsed(collapsed)}
        width={250}
        theme="light"
        style={{ borderRight: "1px solid #f0f0f0" }}
      >
        <div style={{ padding: "16px" }}>
          <Title level={4}>Assistants</Title>
          {loadingAssistants ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin />
            </div>
          ) : (
            <Menu
              selectedKeys={[selectedAssistant]}
              onClick={({ key }) => changeSelectedAssistant(key)}
            >
              {assistants?.map((assistant) => (
                <Menu.Item key={assistant.id}>{assistant.name}</Menu.Item>
              ))}
            </Menu>
          )}
        </div>

        {selectedAssistant && (
          <div style={{ padding: "16px", borderTop: "1px solid #f0f0f0" }}>
            <Title level={4}>Threads</Title>
            {loadingThreads ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin />
              </div>
            ) : (
              <List
                size="small"
                dataSource={threads}
                renderItem={(thread) => (
                  <List.Item
                    onClick={() => changeSelectedThread(thread.id)}
                    style={{
                      cursor: "pointer",
                      backgroundColor:
                        selectedThread === thread.id
                          ? "#e6f7ff"
                          : "transparent",
                    }}
                  >
                    <Typography.Text>
                      {thread.title || "New Thread"}
                    </Typography.Text>
                  </List.Item>
                )}
              />
            )}
          </div>
        )}
      </Sider>

      <Content style={{ padding: "24px", backgroundColor: "#fff" }}>
        <Container
          selectedAssistant={selectedAssistant}
          selectedThread={selectedThread}
        />
      </Content>
    </Layout>
  );
}

export default ChatContainer;
