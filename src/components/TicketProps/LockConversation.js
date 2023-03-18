import { lockConversation } from "@/services/index";
import { LockOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Row, Space, Typography, Modal, message } from "antd";

const { confirm } = Modal;

function LockConversation({ id }) {
  const queryClient = useQueryClient();

  const { mutateAsync: lock } = useMutation((data) => lockConversation(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", id]);
      message.success("Percakapan berhasil dikunci");
    },
    onError: () => message.error("Percakapan gagal dikunci"),
  });

  const handleSubmit = () => {
    confirm({
      title: "Apakah Anda yakin ingin mengunci percakapan ini?",
      width: 800,
      centered: true,
      content:
        "Pengguna tidak bisa berkomentar di tiket ini. Anda dapat membuka kembali percakapan ini kapan saja.",
      onOk: async () => {
        console.log("test");
        await lock(id);
      },
    });
  };

  return (
    <Row>
      <Space>
        <LockOutlined />
        <Typography.Link onClick={handleSubmit} style={{ fontSize: 12 }}>
          Kunci Percakapan
        </Typography.Link>
      </Space>
    </Row>
  );
}

export default LockConversation;
