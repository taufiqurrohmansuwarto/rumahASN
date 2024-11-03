import React, { useEffect } from "react";
import { Flex, Select, Button, Typography } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { AssistantAIServices } from "@/services/assistant-ai.services";

const { Text } = Typography;

export const AssistantSelector = ({
  collapsed,
  onCollapse,
  currentAssistant,
  onAssistantChange,
}) => {
  const {
    data: assistants,
    isLoading,
    isSuccess,
  } = useQuery(["assistants"], AssistantAIServices.getAssistants, {
    staleTime: 5 * 60 * 1000,
    // Menambahkan retry untuk memastikan data terload
    retry: 2,
    // Menambahkan refetch on mount untuk memastikan data selalu fresh
    refetchOnMount: true,
  });

  // Auto select first assistant when data is loaded
  useEffect(() => {
    if (isSuccess && assistants?.length > 0 && !currentAssistant) {
      onAssistantChange(assistants[0].id);
    }
  }, [isSuccess, assistants, currentAssistant, onAssistantChange]);

  const renderAssistantOption = (assistant) => ({
    value: assistant.id,
    label: (
      <Flex gap="small" align="center" style={{ padding: "4px 0" }}>
        <RobotOutlined style={{ fontSize: 16, color: "#1677ff" }} />
        <Flex vertical gap="4px">
          <Text strong>{assistant.name}</Text>
          {assistant.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {assistant.description}
            </Text>
          )}
        </Flex>
      </Flex>
    ),
  });

  return (
    <Flex
      align="center"
      gap="middle"
      style={{
        padding: 16,
        borderBottom: "1px solid #f0f0f0",
        background: "#ffffff",
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => onCollapse(!collapsed)}
      />
      <Select
        style={{ flex: 1 }}
        value={currentAssistant}
        onChange={onAssistantChange}
        loading={isLoading}
        placeholder={
          <Flex gap="small" align="center">
            <RobotOutlined />
            <Text type="secondary">
              {isLoading ? "Loading assistants..." : "Select an Assistant"}
            </Text>
          </Flex>
        }
        popupMatchSelectWidth={false}
        options={assistants?.map(renderAssistantOption)}
        disabled={isLoading}
        status={isLoading ? "loading" : undefined}
      />
    </Flex>
  );
};
