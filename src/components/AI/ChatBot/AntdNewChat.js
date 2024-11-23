import Welcome from "../Welcome";
import { useQuery } from "@tanstack/react-query";
import { AssistantAIServices } from "@/services/assistant-ai.services";
import { useRouter } from "next/router";

function AntdNewChat() {
  const router = useRouter();
  const { data: assistants, isLoading: loadingAssistants } = useQuery(
    ["assistants"],
    () => AssistantAIServices.getAssistants(),
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  const currentAssistant = assistants?.find(
    (assistant) => assistant.id === router.query.assistantId
  );

  return (
    <>
      <Welcome
        icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
        title={currentAssistant?.name}
        description="Artificial Intelligence untuk Pelayanan yang Responsif, Inovatif, Modern dan Akuntabel"
      />
    </>
  );
}

export default AntdNewChat;
