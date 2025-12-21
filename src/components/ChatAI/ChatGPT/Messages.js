import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import { AssistantAIServices } from "@/services/assistant-ai.services";
import { Comment } from "@ant-design/compatible";
import { RobotOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, Spin, Tooltip, List } from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useRef, useState } from "react";

const Messages = () => {
  const { data: user } = useSession();
  const router = useRouter();
  const threadId = router.query.threadId;
  const assistantId = router.query.assistantId;
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const listRef = useRef({});
  const rowHeight = useRef({});

  const { data, isLoading } = useQuery(
    ["thread-messages", threadId],
    () => AssistantAIServices.getThreadMessages({ assistantId, threadId }),
    {
      enabled: !!threadId && !!assistantId,
    }
  );

  const { mutate: sendMessage, isLoading: isSendingMessage } = useMutation(
    (data) => AssistantAIServices.sendMessage(data),
    {
      onMutate: async ({ message }) => {
        await queryClient.cancelQueries(["thread-messages", threadId]);
        const previousMessages = queryClient.getQueryData([
          "thread-messages",
          threadId,
        ]);
        queryClient.setQueryData(["thread-messages", threadId], (old) => [
          ...old,
          {
            id: Date.now(),
            content: message,
            role: "user",
            created_at: new Date().toISOString(),
            user: {
              username: user?.user?.name,
              image: user?.user?.image,
            },
          },
        ]);
        return { previousMessages };
      },
      onError: (err, newMessage, context) => {
        queryClient.setQueryData(
          ["thread-messages", threadId],
          context.previousMessages
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries(["thread-messages", threadId]);
      },
    }
  );

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const setRowHeight = (index, size) => {
    listRef.current.resetAfterIndex(0);
    rowHeight.current = { ...rowHeight.current, [index]: size };
  };

  const scrollToBottom = () => {
    listRef.current.scrollToItem(data?.length - 1, "end");
  };

  const handleSubmit = () => {
    if (!message.trim()) return;
    sendMessage({
      assistantId,
      threadId,
      message,
    });
    setMessage("");
  };

  const rowRenderer = ({ index, key, style }) => {
    const msg = data[index];
    return (
      <div key={key} style={style}>
        <Comment
          content={<ReactMarkdownCustom>{msg?.content}</ReactMarkdownCustom>}
          author={msg?.role === "user" ? msg?.user?.username : "AI"}
          avatar={
            <Avatar
              src={msg?.role === "user" ? msg?.user?.image : null}
              icon={msg?.role === "user" ? null : <RobotOutlined />}
              size="large"
            />
          }
          datetime={
            <Tooltip title={dayjs(msg?.created_at).format("DD-MM-YYYY HH:mm")}>
              <span>{dayjs(msg?.created_at).fromNow()}</span>
            </Tooltip>
          }
        />
      </div>
    );
  };

  return (
    <Spin spinning={isLoading}>
      <List
        id="list"
        ref={listRef}
        data={data}
        height={600}
        disabled={true}
        itemHeight={82}
        itemKey="id"
      >
        {(item, props) => (
          <Comment
            avatar={
              <Avatar
                src={item?.role === "user" ? item?.user?.image : null}
                icon={item?.role === "user" ? null : <RobotOutlined />}
              />
            }
            author={item?.role === "user" ? item?.user?.username : "AI"}
            content={<ReactMarkdownCustom>{item?.content}</ReactMarkdownCustom>}
            datetime={
              <Tooltip
                title={dayjs(item?.created_at).format("DD-MM-YYYY HH:mm")}
              >
                <span>{dayjs(item?.created_at).fromNow()}</span>
              </Tooltip>
            }
          />
        )}
      </List>
    </Spin>
  );
};

export default Messages;
