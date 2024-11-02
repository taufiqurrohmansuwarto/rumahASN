import React from "react";
import { Button, Dropdown, Space, Typography } from "antd";
import {
  RobotOutlined,
  DownOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { getAssistants } from "@/services/bot-ai.services";

const { Text } = Typography;

const BotAssistantSelector = ({
  onToggleCollapse,
  collapsed,
  currentAssistantId,
  onSelect,
}) => {
  // Fetch assistants
  const { data: assistants, isLoading } = useQuery(
    ["assistants"],
    getAssistants,
    {
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Failed to fetch assistants"
        );
      },
      staleTime: 5 * 60 * 1000,
    }
  );

  // Find current assistant
  const currentAssistant = assistants?.find((a) => a.id === currentAssistantId);

  // Prepare menu items
  const items =
    assistants?.map((assistant) => ({
      key: assistant.id,
      label: (
        <div style={{ padding: "8px 0" }}>
          <Space>
            <RobotOutlined
              style={{
                color:
                  assistant.id === currentAssistantId ? "#1890ff" : "inherit",
              }}
            />
            <div>
              <Text strong={assistant.id === currentAssistantId}>
                {assistant.name}
              </Text>
              <div style={{ fontSize: "12px", color: "rgba(0, 0, 0, 0.45)" }}>
                {assistant.description || "AI Assistant"}
              </div>
            </div>
          </Space>
        </div>
      ),
    })) || [];

  return (
    <div
      style={{
        borderBottom: "1px solid #f0f0f0",
        padding: "8px 16px",
        background: "#fff",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggleCollapse}
        style={{ marginRight: 8 }}
      />

      <Dropdown
        menu={{
          items,
          onClick: ({ key }) => onSelect(key),
          selectedKeys: [currentAssistantId],
        }}
        trigger={["click"]}
        placement="bottomLeft"
        disabled={isLoading}
        overlayStyle={{
          width: 320,
        }}
      >
        <Button
          type="text"
          style={{
            width: "100%",
            textAlign: "left",
            height: 40,
          }}
          loading={isLoading}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Space>
              <RobotOutlined />
              <Text strong>{currentAssistant?.name || "Select Assistant"}</Text>
            </Space>
            <DownOutlined style={{ fontSize: 12 }} />
          </div>
        </Button>
      </Dropdown>
    </div>
  );
};

export default BotAssistantSelector;
