import React, { useState } from "react";
import {
  Button,
  Dropdown,
  Space,
  Tag,
  Typography,
  Checkbox,
  Divider,
  Empty,
} from "antd";
import { TagOutlined, PlusOutlined, CloseOutlined } from "@ant-design/icons";
import {
  useUserLabels,
  useEmailLabels,
  useAssignLabel,
  useRemoveLabel,
} from "@/hooks/useEmails";

const { Text } = Typography;

const EmailLabelSelector = ({
  emailId,
  onRefresh,
  trigger = "click",
  disabled = false,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Hooks
  const { data: allLabelsData } = useUserLabels();
  const { data: emailLabelsData } = useEmailLabels(emailId);
  const assignMutation = useAssignLabel();
  const removeMutation = useRemoveLabel();

  const allLabels = allLabelsData?.data || [];
  const emailLabels = emailLabelsData?.data || [];
  const emailLabelIds = emailLabels.map((label) => label.id);

  // Separate system and custom labels
  const systemLabels = allLabels.filter((label) => label.is_system);
  const customLabels = allLabels.filter((label) => !label.is_system);

  const handleLabelToggle = async (label, checked) => {
    try {
      if (checked) {
        await assignMutation.mutateAsync({ emailId, labelId: label.id });
      } else {
        await removeMutation.mutateAsync({ emailId, labelId: label.id });
      }
      onRefresh?.();
    } catch (error) {
      // Error handled by hooks
    }
  };

  const renderLabelItem = (label) => {
    const isAssigned = emailLabelIds.includes(label.id);

    return (
      <div
        key={label.id}
        style={{
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          borderRadius: "4px",
          transition: "background-color 0.2s",
          backgroundColor: isAssigned ? "#e6f7ff" : "transparent",
        }}
        onMouseEnter={(e) => {
          if (!isAssigned) {
            e.currentTarget.style.backgroundColor = "#f5f5f5";
          }
        }}
        onMouseLeave={(e) => {
          if (!isAssigned) {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
        onClick={() => handleLabelToggle(label, !isAssigned)}
      >
        <Checkbox
          checked={isAssigned}
          onChange={(e) => {
            e.stopPropagation();
            handleLabelToggle(label, e.target.checked);
          }}
          style={{ marginRight: "12px" }}
        />

        <TagOutlined
          style={{
            color: label.color,
            marginRight: "8px",
            fontSize: "14px",
          }}
        />

        <Text style={{ flex: 1 }}>{label.name}</Text>

        {label.is_system && (
          <Tag size="small" color="blue" style={{ marginLeft: "8px" }}>
            System
          </Tag>
        )}
      </div>
    );
  };

  const dropdownContent = (
    <div style={{ width: "280px", padding: "8px 0" }}>
      {/* System Labels Section */}
      {systemLabels.length > 0 && (
        <>
          <div style={{ padding: "8px 12px" }}>
            <Text
              strong
              style={{
                fontSize: "12px",
                color: "#8c8c8c",
                textTransform: "uppercase",
              }}
            >
              Label System
            </Text>
          </div>
          {systemLabels.map(renderLabelItem)}

          {customLabels.length > 0 && <Divider style={{ margin: "8px 0" }} />}
        </>
      )}

      {/* Custom Labels Section */}
      {customLabels.length > 0 && (
        <>
          <div style={{ padding: "8px 12px" }}>
            <Text
              strong
              style={{
                fontSize: "12px",
                color: "#8c8c8c",
                textTransform: "uppercase",
              }}
            >
              Label Custom
            </Text>
          </div>
          {customLabels.map(renderLabelItem)}
        </>
      )}

      {/* Empty state */}
      {allLabels.length === 0 && (
        <div style={{ padding: "16px", textAlign: "center" }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Belum ada label"
            style={{ margin: 0 }}
          />
        </div>
      )}

      {/* Footer hint */}
      <Divider style={{ margin: "8px 0" }} />
      <div style={{ padding: "8px 12px" }}>
        <Text type="secondary" style={{ fontSize: "12px" }}>
          <PlusOutlined style={{ marginRight: "4px" }} />
          Kelola label di sidebar untuk menambah label baru
        </Text>
      </div>
    </div>
  );

  return (
    <div>
      {/* Current Labels Display */}
      {emailLabels.length > 0 && (
        <Space wrap size="small" style={{ marginBottom: "8px" }}>
          {emailLabels.map((label) => (
            <Tag
              key={label.id}
              style={{
                backgroundColor: label.color + "20", // 20% opacity
                borderColor: label.color,
                color: label.color,
                margin: "2px",
              }}
              closable={true} // Allow removing all labels including system
              closeIcon={<CloseOutlined style={{ fontSize: "10px" }} />}
              onClose={(e) => {
                e.preventDefault();
                handleLabelToggle(label, false);
              }}
            >
              <Space size="small">
                <TagOutlined style={{ fontSize: "12px" }} />
                {label.name}
                {label.is_system && (
                  <span style={{ fontSize: "10px", opacity: 0.7 }}>
                    (System)
                  </span>
                )}
              </Space>
            </Tag>
          ))}
        </Space>
      )}

      {/* Add/Edit Label Button */}
      <Dropdown
        overlay={dropdownContent}
        trigger={[trigger]}
        open={dropdownVisible}
        onOpenChange={setDropdownVisible}
        placement="bottomLeft"
      >
        <Button
          type="text"
          size="small"
          icon={<TagOutlined />}
          disabled={disabled}
          loading={assignMutation.isLoading || removeMutation.isLoading}
          style={{
            color: "#8c8c8c",
            border: "1px dashed #d9d9d9",
            borderRadius: "4px",
            padding: "4px 8px",
          }}
        >
          {emailLabels.length === 0 ? "Tambah Label" : "Edit Label"}
        </Button>
      </Dropdown>
    </div>
  );
};

export default EmailLabelSelector;
