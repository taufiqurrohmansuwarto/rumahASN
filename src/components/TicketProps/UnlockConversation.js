import { unlockConversation } from "@/services/index";
import { UnlockOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Space, Typography, Row, Modal, message } from "antd";

const { confirm } = Modal;

function UnlockConversation({ id }) {
  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = useMutation(
    (data) => unlockConversation(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["publish-ticket", id]);
        message.success("Percakapan berhasil dibuka kembali");
      },
      onError: () => message.error("Percakapan gagal dibuka kembali"),
    }
  );

  const handleSubmit = () => {
    confirm({
      title: "Apakah Anda yakin ingin membuka kembali percakapan ini?",
      content:
        "Percakapan yang sudah dibuka kembali dapat diakses oleh pelanggan",
      onOk: async () => {
        await mutateAsync(id);
      },
      centered: true,
      width: 800,
    });
  };

  return (
    <Row>
      <Space>
        <UnlockOutlined />
        <Typography.Link onClick={handleSubmit} style={{ fontSize: 12 }}>
          Buka Percakapan
        </Typography.Link>
      </Space>
    </Row>
  );
}

export default UnlockConversation;
