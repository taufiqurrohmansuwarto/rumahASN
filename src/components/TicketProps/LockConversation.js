import { lockConversation } from "@/services/index";
import { LockOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Space, Typography } from "antd";

function LockConversation({ id }) {
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(
    (data) => lockConversation(data),
    {}
  );

  const handleSubmit = () => {
    mutate(id);
  };

  return (
    <Space onClick={handleSubmit}>
      <LockOutlined />
      <Typography.Text style={{ fontSize: 12 }}>
        Kunci Percakapan
      </Typography.Text>
    </Space>
  );
}

export default LockConversation;
