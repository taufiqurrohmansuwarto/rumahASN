import { LockOutlined } from "@ant-design/icons";
import { Space, Typography } from "antd";

function LockConversation({ id }) {
  return (
    <Space>
      <LockOutlined />
      <Typography.Text style={{ fontSize: 12 }}>
        Kunci Percakapan
      </Typography.Text>
    </Space>
  );
}

export default LockConversation;
