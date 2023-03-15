import { unlockConversation } from "@/services/index";
import { UnlockOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Space, Typography, Row, Modal } from "antd";

const { confirm } = Modal;

function UnlockConversation({ id }) {
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(
    (data) => unlockConversation(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["publish-ticket", id]);
      },
    }
  );

  const handleSubmit = () => {
    // mutate(id);
    confirm({
      title: "Apakah Anda yakin ingin membuka kembali percakapan ini?",
      content:
        "Percakapan yang sudah dibuka kembali dapat diakses oleh pelanggan",
      onOk: () => {
        // mutate(id)
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
          Unlock Conversation
        </Typography.Link>
      </Space>
    </Row>
  );
}

export default UnlockConversation;
