import XProvider from "@/components/AI/XProvider";
import { AssistantAIServices } from "@/services/assistant-ai.services";
import { MenuOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useAssistant } from "ai/react/dist";
import { Avatar, Button, ConfigProvider, Drawer, Grid } from "antd";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AntdChatEmpty from "./AntdChatEmpty";
import AntdChatMessagesNew from "./AntdChatMesssagesNew";
import AntdChatSider from "./AntdChatSider";
import useStyle from "./AntdChatStyle";

const NewButton = ({ styles }) => {
  const router = useRouter();

  const handleNewChat = () => {
    router.push("/chat-ai/new-chat");
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
        icon={
          <Avatar
            size="small"
            src="https://siasn.bkd.jatimprov.go.id:9000/public/bestie-ai-rect-white.png"
          />
        }
        type="primary"
        onClick={handleNewChat}
        className={styles?.addBtn}
      >
        Chat Baru
      </Button>
    </ConfigProvider>
  );
};

function AntDChatContainer() {
  const router = useRouter();
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const { styles } = useStyle();
  const breakPoint = Grid.useBreakpoint();

  const {
    append,
    error,
    handleInputChange,
    input,
    messages,
    setInput,
    setMessages,
    setThreadId,
    status,
    stop,
    submitMessage,
    threadId,
  } = useAssistant({
    api: "/helpdesk/api/assistant/test",
  });

  const logoNode = (
    <div className={styles?.logo}>
      <img
        src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
        draggable={false}
        alt="logo"
      />
      <span>BESTIE AI BKD</span>
    </div>
  );

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Get assistants list
  const { data: assistants, isLoading: loadingAssistants } = useQuery(
    ["assistants"],
    () => AssistantAIServices.getAssistants(),
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  const searchParams = useSearchParams();

  useEffect(() => {
    const assistantId = searchParams.get("assistantId");
    if (assistantId) {
      changeSelectedAssistant(assistantId);
    }
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [searchParams.get("assistantId")]);

  const changeSelectedAssistant = (assistantId) => {
    setSelectedAssistant(assistantId);
    setSelectedThread(null);
    router.push(`/chat-ai?assistantId=${assistantId}`);
  };

  const changeSelectedThread = (threadId) => {
    setSelectedThread(threadId);

    router.push(
      `/chat-ai?${
        selectedAssistant ? `assistantId=${selectedAssistant}&` : ""
      }threadId=${threadId}`
    );
  };

  // Get threads for selected assistant
  const { data: threads, isFetching: loadingThreads } = useQuery(
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
    <XProvider
      theme={{
        token: {
          colorPrimary: "#FF5500",
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
              title={logoNode}
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
                style={styles}
                assistants={assistants}
                threads={threads}
                selectedAssistant={selectedAssistant}
                selectedThread={selectedThread}
                changeSelectedAssistant={(id) => {
                  changeSelectedAssistant(id);
                  isMobile && setDrawerVisible(false);
                }}
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
              loadingAssistants={loadingAssistants}
              loadingThreads={loadingThreads}
              style={styles}
              assistants={assistants}
              threads={threads}
              selectedAssistant={selectedAssistant}
              selectedThread={selectedThread}
              changeSelectedAssistant={(id) => {
                changeSelectedAssistant(id);
                isMobile && setDrawerVisible(false);
              }}
              changeSelectedThread={(id) => {
                changeSelectedThread(id);
                isMobile && setDrawerVisible(false);
              }}
            />
          </div>
        )}
        <div className={styles.chat}>
          {router?.query?.assistantId ? (
            <>
              <AntdChatMessagesNew
                setMessages={setMessages}
                setThreadId={setThreadId}
                messages={messages}
                style={styles}
              />
            </>
          ) : (
            <AntdChatEmpty />
          )}
        </div>
      </div>
    </XProvider>
  );
}

export default AntDChatContainer;
