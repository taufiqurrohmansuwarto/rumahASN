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

function AntdChatMessages({ style }) {
  const router = useRouter();
  const { threadId } = router.query;
  const itemRef = useRef(null);
  const { data: user } = useSession();

  const [copySuccess, setCopySuccess] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["chat-messages", threadId],
    queryFn: () => AssistantAIServices.getThreadMessages({ threadId }),
    enabled: !!threadId,
  });

  const roles = {
    ai: {
      placement: "start",
      typing: {
        step: 100,
        interval: 1000,
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

  return (
    <>
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
                    <Button size="small" type="text" icon={<LikeOutlined />} />
                  </Tooltip>
                  <Tooltip title="Dislike">
                    <Button
                      size="small"
                      type="text"
                      icon={<DislikeOutlined />}
                    />
                  </Tooltip>
                  <Tooltip title="Refresh">
                    <Button size="small" type="text" icon={<SyncOutlined />} />
                  </Tooltip>
                </Flex>
              ),
          }))}
        />
      </Skeleton>
    </>
  );
}

AntdChatMessages.displayName = "AntdChatMessages";

export default AntdChatMessages;
