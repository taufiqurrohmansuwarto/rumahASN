import { AssistantAIServices } from "@/services/assistant-ai.services";
import {
  DeleteOutlined,
  EditOutlined,
  FolderOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Space, Spin, message } from "antd";
import { useRouter } from "next/router";
import Conversations from "../Conversations";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.locale("id");
dayjs.extend(relativeTime);

function AntdChatSider({ style, threads, loadingThreads }) {
  const queryClient = useQueryClient();

  const router = useRouter();
  const { threadId } = router.query;

  const handleRemoveThreadMessages = () => {
    removeThreadMessages({ threadId });
  };

  const {
    mutate: removeThreadMessages,
    isLoading: loadingRemoveThreadMessages,
  } = useMutation((data) => AssistantAIServices.deleteThreadMessages(data), {
    onSuccess: () => {
      router.push(`/chat-ai`);
      message.success("Berhasil menghapus riwayat chat");
      queryClient.invalidateQueries(["threads"]);
    },
  });

  const menuConfig = () => ({
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
      } else {
        message.info(`Kamu memilih ${menuInfo?.key}`);
      }
    },
  });
  return (
    <>
      <Spin spinning={loadingThreads || loadingRemoveThreadMessages}>
        <Conversations
          onActiveChange={(id) => {
            router.push(`/chat-ai/${id}`);
          }}
          menu={menuConfig}
          className={style?.conversations}
          items={threads?.map((thread) => {
            const sekarang = dayjs().diff(dayjs(thread.createdAt), "day") === 0;
            const kemarin = dayjs().diff(dayjs(thread.createdAt), "day") === 1;
            const tigaPuluhHari =
              dayjs().diff(dayjs(thread.createdAt), "day") === 30;
            const bulan = dayjs(thread.createdAt).format("MMMM");

            return {
              label: thread?.title,
              key: thread?.id,
              group: sekarang
                ? "sekarang"
                : kemarin
                ? "kemarin"
                : tigaPuluhHari
                ? "30 hari yang lalu"
                : bulan,
            };
          })}
          activeKey={threadId}
          defaultActiveKey={threadId}
        />
      </Spin>
    </>
  );
}

export default AntdChatSider;
