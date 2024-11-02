// components/BotAssistantsLayout/index.js
import React, { useState } from "react";
import {
  Layout,
  Menu,
  Typography,
  Button,
  Dropdown,
  Space,
  Switch,
} from "antd";
import {
  MenuUnfoldOutlined,
  PlusOutlined,
  RobotOutlined,
  ClockCircleOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { getAssistants } from "@/services/bot-ai.services";

const { Sider, Content } = Layout;
const { Text } = Typography;

const AssistantSelector = ({ selectedAssistant, onSelect }) => {
  const { data: assistants } = useQuery(["assistants"], getAssistants);

  const dropdownItems = {
    items: [
      {
        key: "plus",
        label: (
          <div style={{ padding: "8px 0" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Space>
                <RobotOutlined />
                <div>
                  <div>ChatGPT Plus</div>
                  <div
                    style={{ fontSize: "12px", color: "rgba(0, 0, 0, 0.45)" }}
                  >
                    Our smartest model & more
                  </div>
                </div>
              </Space>
              <Button size="small" type="primary">
                Upgrade
              </Button>
            </div>
          </div>
        ),
      },
      {
        type: "divider",
        style: { margin: "4px 0" },
      },
      ...(assistants?.map((assistant) => ({
        key: assistant.id,
        label: (
          <div style={{ padding: "8px 0" }}>
            <Space>
              <RobotOutlined />
              <div>
                <div>{assistant.name}</div>
                <div style={{ fontSize: "12px", color: "rgba(0, 0, 0, 0.45)" }}>
                  {assistant.description || "Great for everyday tasks"}
                </div>
              </div>
            </Space>
          </div>
        ),
      })) || []),
      {
        type: "divider",
        style: { margin: "4px 0" },
      },
      {
        key: "temporary",
        label: (
          <div style={{ padding: "8px 0" }}>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Space>
                <ClockCircleOutlined />
                <span>Temporary chat</span>
              </Space>
              <Switch size="small" />
            </Space>
          </div>
        ),
      },
    ],
  };

  return (
    <Dropdown
      menu={dropdownItems}
      trigger={["click"]}
      placement="bottomLeft"
      overlayStyle={{
        width: "300px",
      }}
    >
      <Button
        type="text"
        style={{
          height: "auto",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Space>
          <Text strong>{selectedAssistant?.name || "ChatGPT"}</Text>
        </Space>
        <DownOutlined style={{ fontSize: "12px" }} />
      </Button>
    </Dropdown>
  );
};

const BotAssistantsLayout = ({ children }) => {
  const router = useRouter();
  const { data: assistants } = useQuery(["assistants"], getAssistants);
  const currentAssistant = assistants?.find(
    (a) => a.id === router.query?.assistantId
  );

  const handleSelect = (key) => {
    if (key !== "temporary" && key !== "plus") {
      router.push(`/asn-connect/asn-ai-chat/${key}/threads`);
    }
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider
        width={280}
        style={{
          background: "#f7f7f8",
          borderRight: "1px solid #e5e5e5",
          overflow: "auto",
        }}
      >
        <div style={{ padding: "16px" }}>
          <Button
            block
            icon={<PlusOutlined />}
            style={{ marginBottom: "16px" }}
            onClick={() => router.push("/asn-connect/asn-ai-chat")}
          >
            New chat
          </Button>

          <Menu
            mode="inline"
            selectedKeys={[router.query?.threadId]}
            style={{
              background: "transparent",
              border: "none",
            }}
            items={[
              {
                type: "group",
                label: "Yesterday",
                children: [
                  {
                    key: "chat1",
                    label: "Previous Chat 1",
                  },
                ],
              },
              {
                type: "group",
                label: "Previous 7 Days",
                children: [
                  {
                    key: "chat2",
                    label: "Previous Chat 2",
                  },
                ],
              },
            ]}
          />
        </div>
      </Sider>

      <Layout>
        <div
          style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          {/* Header with Assistant Selector */}
          <div
            style={{
              borderBottom: "1px solid #e5e5e5",
              padding: "4px",
              background: "#fff",
            }}
          >
            <AssistantSelector
              selectedAssistant={currentAssistant}
              onSelect={handleSelect}
            />
          </div>

          {/* Main Content */}
        </div>
      </Layout>
    </Layout>
  );
};

export default BotAssistantsLayout;
