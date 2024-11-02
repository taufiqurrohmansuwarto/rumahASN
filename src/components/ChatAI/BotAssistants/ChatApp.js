import ChatContainer from "@/components/ChatAI/BotAssistants/ChatContainer";
import ChatHistory from "@/components/ChatAI/BotAssistants/ChatHistory";
import { ConfigProvider, Drawer, Layout, Typography } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import { useStyles } from "./styles";
import BotAssistantSelector from "./BotAssistantSelector";

const { Header, Sider } = Layout;
const { Title } = Typography;

const ChatApp = ({ height = "100vh" }) => {
  const router = useRouter();
  const assistantId = router.query?.assistantId;

  const { styles } = useStyles();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleSelectAssistant = (selectedAssistantId) => {
    if (selectedAssistantId !== "temporary" && selectedAssistantId !== "plus") {
      router.push(`/asn-connect/asn-ai-chat/${selectedAssistantId}/threads`);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#262626",
          borderRadius: 8,
          borderRadiusLG: 12,
        },
      }}
    >
      <Layout style={{ height }}>
        <ChatHistory assistantId={assistantId} />

        {/* main content */}
        <Layout
          style={{
            marginLeft: collapsed ? 0 : 280,
            transition: "all 0.2s",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <BotAssistantSelector
            onSelect={handleSelectAssistant}
            onToggleCollapse={() => setCollapsed(!collapsed)}
            collapsed={collapsed}
            currentAssistantId={assistantId}
          />

          <div
            style={{
              flex: 1,
              height: "calc(100vh - 56px)", // Header height
              overflow: "hidden",
            }}
          >
            <ChatContainer />
          </div>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default ChatApp;
