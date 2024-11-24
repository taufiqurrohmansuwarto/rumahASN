import Conversations from "../Conversations";
import { Divider, Typography, message } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AssistantAIServices } from "@/services/assistant-ai.services";
import { useRouter } from "next/router";

function AntdChatSider({
  style,
  assistants,
  threads,
  selectedAssistant,
  selectedThread,
  changeSelectedAssistant,
  changeSelectedThread,
}) {
  const queryClient = useQueryClient();

  const {
    mutate: removeThreadMessages,
    isLoading: loadingRemoveThreadMessages,
  } = useMutation((data) => AssistantAIServices.deleteThreadMessages(data), {
    onSuccess: () => {
      router.push(`/chat-ai?assistantId=${assistantId}`);
      message.success("Berhasil menghapus riwayat chat");
      queryClient.invalidateQueries(["threads"]);
    },
  });

  const router = useRouter();
  const { assistantId, threadId } = router.query;

  const handleRemoveThreadMessages = () => {
    removeThreadMessages({ assistantId, threadId });
  };

  const menuConfig = (conversation) => ({
    items: [
      { label: "Share", key: "share", icon: <ShareAltOutlined /> },
      { label: "Rename", key: "rename", icon: <EditOutlined /> },
      {
        label: "Archive",
        key: "archive",
        icon: <FolderOutlined />,
      },
      {
        label: "Hapus",
        key: "delete",
        icon: <DeleteOutlined />,
        danger: true,
      },
    ],
    onClick: (menuInfo) => {
      if (menuInfo.key === "delete") {
        handleRemoveThreadMessages();
      }
    },
  });
  return (
    <>
      <Divider orientation="left">
        <Typography.Text strong>
          🤖 Assistants ({assistants?.length})
        </Typography.Text>
      </Divider>
      {assistants && (
        <Conversations
          className={style?.assistants}
          onActiveChange={changeSelectedAssistant}
          items={assistants}
          defaultActiveKey={selectedAssistant}
        />
      )}
      <Divider orientation="left">
        <Typography.Text strong>
          💬 Riwayat Chat ({threads?.length})
        </Typography.Text>
      </Divider>
      {threads && (
        <Conversations
          menu={menuConfig}
          className={style?.conversations}
          onActiveChange={changeSelectedThread}
          items={threads}
          defaultActiveKey={selectedThread}
        />
      )}
    </>
  );
}

export default AntdChatSider;
