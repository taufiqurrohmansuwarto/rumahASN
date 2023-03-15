import { UnlockOutlined } from "@ant-design/icons";
import { Space, Typography } from "antd";

function UnlockConversation({ id }) {
  return (
    <Space>
      <UnlockOutlined />
      <Typography.Text style={{ fontSize: 12 }}>
        Buka Kunci Percakapan
      </Typography.Text>
    </Space>
  );
}

export default UnlockConversation;
