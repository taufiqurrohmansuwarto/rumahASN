import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import { AssistantAIServices } from "@/services/assistant-ai.services";
import useChatStore from "@/store/useChat";
import {
  CopyOutlined,
  DislikeOutlined,
  FrownOutlined,
  LikeOutlined,
  SmileOutlined,
  SyncOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Flex, Skeleton } from "antd";
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
        maxWidth: "100%",
        marginInlineEnd: 44,
      },
    },
    user: {
      variant: "shadow",
      placement: "end",
      style: {
        maxWidth: "100%",
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
                <ReactMarkdownCustom withCustom>
                  {item.content}
                </ReactMarkdownCustom>
              ),
              footer:
                item.role === "user" ? null : (
                  <Flex>
                    <Button
                      size="small"
                      type="text"
                      icon={<CopyOutlined />}
                      style={{
                        marginInlineEnd: "auto",
                      }}
                    />
                    <Button size="small" type="text" icon={<LikeOutlined />} />
                    <Button
                      size="small"
                      type="text"
                      icon={<DislikeOutlined />}
                    />
                  </Flex>
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
