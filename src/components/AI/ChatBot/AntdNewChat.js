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
    <div style={{ paddingTop: "24px" }}>
      <Welcome
        icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
        title="BESTIE (BKD Expert System & Technical Intelligence Engine)"
        description="Your HR Bestie, Always Ready!"
      />
    </div>
  );
}

export default AntdNewChat;
