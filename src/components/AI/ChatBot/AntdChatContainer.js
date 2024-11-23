import { AssistantAIServices } from "@/services/assistant-ai.services";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AntdChatSider from "./AntdChatSider";
import AntdChatSender from "./AntdChatSender";
import useStyle from "./AntdChatStyle";
import AntdChatMessages from "./AntdChatMessages";

function AntDChatContainer() {
  const router = useRouter();
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const { styles } = useStyle();

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
    <div className={styles.layout}>
      <div className={styles.menu}>
        <AntdChatSider
          style={styles}
          assistants={assistants}
          threads={threads}
          selectedAssistant={selectedAssistant}
          selectedThread={selectedThread}
          changeSelectedAssistant={changeSelectedAssistant}
          changeSelectedThread={changeSelectedThread}
        />
      </div>
      <div className={styles.chat}>
        <AntdChatMessages style={styles} />
        <AntdChatSender style={styles} />
      </div>
    </div>
  );
}

export default AntDChatContainer;
