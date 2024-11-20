import { useQuery } from "@tanstack/react-query";
import { AssistantAIServices } from "@/services/assistant-ai.services";
import { useRouter } from "next/router";
import { Avatar, Spin } from "antd";
import { Comment } from "@ant-design/compatible";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";

dayjs.extend(relativeTime);

const Messages = () => {
  const router = useRouter();
  const threadId = router.query.threadId;
  const assistantId = router.query.assistantId;

  const { data, isLoading } = useQuery(
    ["thread-messages", threadId],
    () => AssistantAIServices.getThreadMessages({ assistantId, threadId }),
    {
      enabled: !!threadId && !!assistantId,
    }
  );

  return (
    <Spin spinning={isLoading}>
      {data?.map((message) => {
        return (
          <Comment
            content={
              <ReactMarkdownCustom>{message?.content}</ReactMarkdownCustom>
            }
            key={message?.id}
            author={message?.role === "user" ? message?.user?.username : "AI"}
            avatar={
              <Avatar
                src={message?.role === "user" ? message?.user?.image : ""}
                size="large"
              />
            }
            datetime={dayjs(message?.created_at).fromNow()}
          />
        );
      })}
    </Spin>
  );
};

export default Messages;
