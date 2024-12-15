import XProvider from "@/components/AI/XProvider";
import { AssistantAIServices } from "@/services/assistant-ai.services";
import { EditOutlined, MenuOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, ConfigProvider, Drawer, Grid } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import AntdChatSider from "./AntdChatSider";
import useStyle from "./AntdChatStyle";

const NewButton = ({ styles }) => {
  const router = useRouter();

  const handleNewChat = () => {
    router.push("/chat-ai");
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#FF5500",
        },
      }}
    >
      <Button
        size="large"
        shape="round"
        icon={<EditOutlined />}
        type="primary"
        onClick={handleNewChat}
        className={styles?.addBtn}
      >
        Chat Baru
      </Button>
    </ConfigProvider>
  );
};

function AntDChatLayoutContainer({ children, setThreadId }) {
  const router = useRouter();
  const [selectedThread, setSelectedThread] = useState(null);
  const { styles } = useStyle();
  const breakPoint = Grid.useBreakpoint();

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const changeSelectedThread = (threadId) => {
    setSelectedThread(threadId);
    setThreadId(threadId);
    router.push(`/chat-ai/${threadId}`);
  };

  // Get threads for selected assistant
  const { data: threads, isFetching: loadingThreads } = useQuery(
    ["threads"],
    () => AssistantAIServices.getAssistantThreads(),
    {
      staleTime: 1000 * 60, // 1 minute
    }
  );

  return (
    <XProvider
      theme={{
        token: {
          colorPrimary: "#FF5500",
          fontSize: 15,
        },
      }}
    >
      <div className={styles.layout}>
        {breakPoint?.xs ? (
          <>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
              className={styles.menuButton}
            />
            <Drawer
              width={300}
              placement="left"
              onClose={() => setDrawerVisible(false)}
              open={drawerVisible}
              styles={{
                body: {
                  padding: 0,
                },
              }}
            >
              <AntdChatSider
                loadingThreads={loadingThreads}
                style={styles}
                threads={threads}
                selectedThread={selectedThread}
                changeSelectedThread={(id) => {
                  changeSelectedThread(id);
                  isMobile && setDrawerVisible(false);
                }}
              />
            </Drawer>
          </>
        ) : (
          <div className={styles.menu}>
            <NewButton styles={styles} />
            <AntdChatSider
              loadingThreads={loadingThreads}
              style={styles}
              threads={threads}
              selectedThread={selectedThread}
              changeSelectedThread={(id) => {
                changeSelectedThread(id);
                isMobile && setDrawerVisible(false);
              }}
            />
          </div>
        )}
        <div className={styles.chat}>{children}</div>
      </div>
    </XProvider>
  );
}

export default AntDChatLayoutContainer;
