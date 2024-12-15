import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";

import { AssistantAIServices } from "@/services/assistant-ai.services";
import {
  CheckOutlined,
  CopyOutlined,
  DislikeOutlined,
  LikeOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Flex, Skeleton, Tooltip } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import BubbleList from "../BubbleList";
import { Space, Spin } from "antd";

function AntdChatMessagesNew({ style, setMessages, messages, status }) {
  const router = useRouter();
  const { threadId } = router.query;
  const itemRef = useRef(null);
  const { data: user } = useSession();

  const [copySuccess, setCopySuccess] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["chat-messages", threadId],
    queryFn: () => AssistantAIServices.getThreadMessages({ threadId }),
    enabled: !!threadId,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      setMessages([...data]);
    },
  });

  const roles = {
    assistant: {
      placement: "start",
      typing: {
        step: 5,
        interval: 20,
      },
      avatar: {
        icon: (
          <Avatar src="https://siasn.bkd.jatimprov.go.id:9000/public/bestie-ai-rect-avatar.png" />
        ),
        style: {
          background: "#fde3cf",
          maxWidth: 600,
        },
      },
      styles: {
        header: {},
      },
      style: {
        maxWidth: "100%",
        marginInlineEnd: 44,
      },
      loadingRender: () => (
        <Space>
          <Spin size="small" />
          Bestie AI is thinking...
        </Space>
      ),
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

  const handleCopy = (item) => {
    navigator.clipboard.writeText(item.content);
    setCopySuccess({ ...copySuccess, [item.id]: true });
    setTimeout(() => {
      setCopySuccess({ ...copySuccess, [item.id]: false });
    }, 2000);
  };

  // cari pesan terakhir dengan role user dan id awalan mgs_
  const checkLastMessage = () => {
    const last = messages[messages.length - 1];
    if (last.role === "user" && !last.id.startsWith("mgs_")) {
      return true;
    } else {
      return false;
    }
  };

  const items =
    status === "in_progress" && checkLastMessage()
      ? [
          ...messages,
          {
            id: Date.now(),
            content: "Typing...",
            role: "assistant",
            loading: true,
          },
        ]
      : messages;

  return (
    <>
      <Skeleton active loading={isLoading}>
        <BubbleList
          ref={itemRef}
          className={style?.messages}
          roles={roles}
          items={items?.map((item) => ({
            key: item.id,
            ...item,
            role: item.role === "ai" ? "assistant" : item.role,
            content: (
              <ReactMarkdownCustom withCustom>
                {item.content}
              </ReactMarkdownCustom>
            ),
            footer:
              item.role === "user" ? null : (
                <>
                  {item?.loading ? null : (
                    <Flex>
                      <Tooltip title={copySuccess[item.id] ? "Copied" : "Copy"}>
                        <Button
                          size="small"
                          type="text"
                          icon={
                            copySuccess[item.id] ? (
                              <CheckOutlined style={{ color: "green" }} />
                            ) : (
                              <CopyOutlined />
                            )
                          }
                          onClick={() => handleCopy(item)}
                          style={{
                            marginInlineEnd: "auto",
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="Like">
                        <Button
                          size="small"
                          type="text"
                          icon={<LikeOutlined />}
                        />
                      </Tooltip>
                      <Tooltip title="Dislike">
                        <Button
                          size="small"
                          type="text"
                          icon={<DislikeOutlined />}
                        />
                      </Tooltip>
                      <Tooltip title="Refresh">
                        <Button
                          size="small"
                          type="text"
                          icon={<SyncOutlined />}
                        />
                      </Tooltip>
                    </Flex>
                  )}
                </>
              ),
          }))}
        />
      </Skeleton>
    </>
  );
}

AntdChatMessagesNew.displayName = "AntdChatMessagesNew";

export default AntdChatMessagesNew;
