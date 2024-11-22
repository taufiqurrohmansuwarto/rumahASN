import { AssistantAIServices } from "@/services/assistant-ai.services";
import { useQuery } from "@tanstack/react-query";
import { Layout, Typography } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Conversations from "../Conversations";

const { Sider, Content } = Layout;
const { Title } = Typography;

const Container = ({ selectedAssistant, selectedThread }) => {
  if (selectedThread) {
    return <div>Messages</div>;
  } else if (selectedAssistant) {
    return <div>NewChat</div>;
  }

  return <div>No assistant or thread selected</div>;
};

function AntDChatContainer() {
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
    <Layout>
      <>
        {assistants && (
          <Conversations
            onActiveChange={changeSelectedAssistant}
            items={assistants}
          />
        )}
        {threads && (
          <Conversations
            onActiveChange={changeSelectedThread}
            items={threads}
          />
        )}
      </>
    </Layout>
  );
}

export default AntDChatContainer;
