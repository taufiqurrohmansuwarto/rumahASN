import { AssistantAIServices } from "@/services/assistant-ai.services";
import { MenuOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Drawer, Grid } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AntdChatMessages from "./AntdChatMessages";
import AntdChatSender from "./AntdChatSender";
import AntdChatSider from "./AntdChatSider";
import useStyle from "./AntdChatStyle";
import AntdChatEmpty from "./AntdChatEmpty";
import { useSearchParams } from "next/navigation";

function AntDChatContainer() {
  const router = useRouter();
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const { styles } = useStyle();
  const breakPoint = Grid.useBreakpoint();

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
          {logoNode}
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
            <AntdChatMessages style={styles} />
            <AntdChatSender style={styles} />
          </>
        ) : (
          <AntdChatEmpty />
        )}
      </div>
    </div>
  );
}

export default AntDChatContainer;
