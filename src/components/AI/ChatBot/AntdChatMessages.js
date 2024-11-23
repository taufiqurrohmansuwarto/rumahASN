import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import { AssistantAIServices } from "@/services/assistant-ai.services";
import useChatStore from "@/store/useChat";
import { UserOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Skeleton } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useRef } from "react";
import BubbleList from "../BubbleList";
import AntdNewChat from "./AntdNewChat";

function AntdChatMessages({ style }) {
  const router = useRouter();
  const { threadId } = router.query;
  const { assistantId } = router.query;
  const { sendSuccess, lastId } = useChatStore();
  const itemRef = useRef(null);
  const { data: user } = useSession();

  const { data, isLoading } = useQuery({
    queryKey: ["chat-messages", threadId, assistantId],
    queryFn: () =>
      AssistantAIServices.getThreadMessages({ threadId, assistantId }),
    enabled: !!threadId && !!assistantId,
  });

  const roles = {
    ai: {
      placement: "start",
      header: "AI Assistant",
      typing: {
        step: 100,
        interval: 1000,
      },
      avatar: {
        icon: <UserOutlined />,
        style: {
          background: "#fde3cf",
        },
      },
      styles: {
        header: {},
      },
      style: {
        maxWidth: 900,
        marginInlineEnd: 44,
      },
    },
    user: {
      variant: "shadow",
      placement: "start",
      style: {
        maxWidth: 900,
      },
      avatar: {
        icon: <Avatar src={user?.user?.image} />,
      },
    },
  };

  return (
    <>
      {threadId && assistantId && (
        <Skeleton active loading={isLoading}>
          <BubbleList
            ref={itemRef}
            className={style?.messages}
            roles={roles}
            items={data?.map((item) => ({
              ...item,
              content: (
                <ReactMarkdownCustom>{item.content}</ReactMarkdownCustom>
              ),
            }))}
          />
        </Skeleton>
      )}
      {assistantId && !threadId && <AntdNewChat />}
    </>
  );
}

AntdChatMessages.displayName = "AntdChatMessages";

export default AntdChatMessages;
