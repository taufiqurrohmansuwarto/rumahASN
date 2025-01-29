import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";

import {
  AssistantAIServices,
  updateResponse,
} from "@/services/assistant-ai.services";
import {
  CheckOutlined,
  CopyOutlined,
  DislikeOutlined,
  LikeOutlined,
} from "@ant-design/icons";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Flex,
  Skeleton,
  Space,
  Spin,
  Tooltip,
  message,
} from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import BubbleList from "../BubbleList";

function AntdChatMessagesNew({ style, setMessages, messages, status }) {
  const queryClient = useQueryClient();

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

  const { mutate: update, isLoading: updateLoading } = useMutation(
    (data) => updateResponse(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["chat-messages", threadId],
        });
      },
      onError: (error) => {
        message.error(error?.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["chat-messages", threadId],
        });
      },
    }
  );

  const handleRespons = (item, type) => {
    const response = type === "like" ? 1 : -1;
    const payload = {
      id: item.id,
      threadId: item.thread_id,
      response,
    };

    update(payload);
  };

  const Response = ({ item }) => {
    const netral = item?.response === 0;
    const like = item?.response === 1;
    const dislike = item?.response === -1;

    return (
      <>
        {(netral || like) && (
          <Tooltip title="Respons yang baik">
            <Button
              size="small"
              type="text"
              icon={<LikeOutlined />}
              onClick={() => handleRespons(item, "like")}
              loading={updateLoading}
              disabled={like}
            />
          </Tooltip>
        )}
        {(netral || dislike) && (
          <Tooltip title="Respons yang buruk">
            <Button
              size="small"
              type="text"
              icon={<DislikeOutlined />}
              onClick={() => handleRespons(item, "dislike")}
              loading={updateLoading}
              disabled={dislike}
            />
          </Tooltip>
        )}
      </>
    );
  };

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
          BestieAI sedang berpikir...
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
                      <Response item={item} />
                      <Tooltip
                        title={copySuccess[item.id] ? "Tersalin" : "Salin"}
                      >
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
