import { AssistantAIServices } from "@/services/assistant-ai.services";
import { RobotOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Flex, Spin } from "antd";
import { useRouter } from "next/router";
import Prompts from "../Prompts";

function AntdChatEmpty() {
  const router = useRouter();
  const { data: assistants, isLoading: loadingAssistants } = useQuery(
    ["assistants"],
    () => AssistantAIServices.getAssistants(),
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  const handleSelectAssistant = (assistantId) => {
    router.push(`/chat-ai?assistantId=${assistantId}`);
  };

  return (
    <Flex
      justify="center"
      align="center"
      wrap="wrap"
      style={{ height: "100%" }}
    >
      <Spin spinning={loadingAssistants}>
        <Prompts
          wrap
          title="✨ Pilih Asisten untuk memulai percakapan"
          items={assistants?.map((assistant) => ({
            key: assistant.id,
            label: assistant.name,
            icon: <RobotOutlined />,
            description: `Model: ${assistant.model}`,
          }))}
          onItemClick={(info) => {
            handleSelectAssistant(info.data.key);
          }}
        />
      </Spin>
    </Flex>
  );
}

export default AntdChatEmpty;
