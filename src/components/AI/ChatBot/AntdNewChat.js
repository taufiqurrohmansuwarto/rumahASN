import {
  BulbOutlined,
  EllipsisOutlined,
  InfoCircleOutlined,
  ShareAltOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Button, Flex, Space } from "antd";
import Prompts from "../Prompts";
import Welcome from "../Welcome";

const items = [
  {
    key: "1",
    icon: (
      <BulbOutlined
        style={{
          color: "#FFD700",
        }}
      />
    ),
    label: "Cek Status Usulan SIASN",
    description: "Yuk cek status usulan SIASN kamu sekarang!",
  },
  {
    key: "2",
    icon: (
      <InfoCircleOutlined
        style={{
          color: "#1890FF",
        }}
      />
    ),
    label: "Uncover Background Info",
    description: "Help me understand the background of this topic.",
  },
  {
    key: "5",
    icon: (
      <WarningOutlined
        style={{
          color: "#FF4D4F",
        }}
      />
    ),
    label: "Common Issue Solutions",
    description: "How to solve common issues? Share some tips!",
  },
];

function AntdNewChat() {
  return (
    <Flex vertical gap={40}>
      <Welcome
        extra={
          <Space>
            <Button icon={<ShareAltOutlined />} />
            <Button icon={<EllipsisOutlined />} />
          </Space>
        }
        icon="https://siasn.bkd.jatimprov.go.id:9000/public/bestie-ai-rect-avatar.png"
        title="Bestie (BKD Expert System & Technical Intelligence Engine)"
        description="Your HR Bestie, Always Ready!"
      />
      <Prompts
        wrap
        title="✨ Inspirational Sparks and Marvelous Tips"
        items={items}
      />
    </Flex>
  );
}

export default AntdNewChat;
