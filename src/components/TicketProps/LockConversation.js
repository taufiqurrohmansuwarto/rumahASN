import { lockConversation } from "@/services/index";
import { LockOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Row, Space, Typography, Modal } from "antd";

const { confirm } = Modal;

function LockConversation({ id }) {
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(
    (data) => lockConversation(data),
    {}
  );

  const handleSubmit = () => {
    // mutate(id);
    confirm({
      title: "Apakah Anda yakin ingin mengunci percakapan ini?",
      width: 800,
      centered: true,
      content:
        "Pengguna tidak bisa berkomentar di tiket ini. Anda dapat membuka kembali percakapan ini kapan saja.",
      onOk: () => {
        // mutate(id)
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
