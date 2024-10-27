import { AssistantModal, useEdgeRuntime } from "@assistant-ui/react";

const AssistantAI = () => {
  const runtime = useEdgeRuntime({
    api: "/api/chat",
  });

  return <AssistantModal runtime={runtime} />;
};

export default AssistantAI;
