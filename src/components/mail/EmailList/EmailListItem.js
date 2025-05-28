// components/mail/EmailList/EmailListItem.js
import {
  FileOutlined,
  MoreOutlined,
  StarFilled,
  StarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Checkbox,
  Dropdown,
  List,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

const EmailListItem = ({
  email,
  config,
  isSelected = false,
  onEmailClick,
  onSelectEmail,
  onStarClick,
  onActionClick,
  getEmailActions,
}) => {
  const isUnread = config.allowMarkAsRead ? !email.is_read : false;
  const showUnreadIndicator = config.showUnreadBadge && isUnread;

  // Format time
  const formatTime = (date) => {
    const now = dayjs();
    const emailDate = dayjs(date);

    if (now.format("YYYY-MM-DD") === emailDate.format("YYYY-MM-DD")) {
      return emailDate.format("HH:mm");
    } else if (now.year() === emailDate.year()) {
      return emailDate.format("DD MMM");
    } else {
      return emailDate.format("DD/MM/YY");
    }
  };

  // Get display name based on folder config
  const getDisplayName = () => {
    if (config.showRecipient && email.recipients?.to?.length > 0) {
      return email.recipients.to[0]?.name || "Unknown";
    }
    return email.sender_name || email.sender?.username || "Unknown";
  };

  const handleEmailClick = () => {
    onEmailClick?.(email);
  };

  const handleSelectEmail = (checked) => {
    onSelectEmail?.(email.id, checked);
  };

  const handleStarClick = (e) => {
    e.stopPropagation();
    onStarClick?.(e, email.id);
  };

  return (
    <List.Item
      key={email.id}
      style={{
        padding: "16px",
        borderBottom: "1px solid #f0f0f0",
        backgroundColor: isSelected
          ? "#e6f7ff"
          : showUnreadIndicator
          ? "#fafbfc"
          : "white",
        borderLeft: showUnreadIndicator
          ? `4px solid ${config.primaryColor}`
          : "4px solid transparent",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onClick={handleEmailClick}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = "#f8f9fa";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = showUnreadIndicator
            ? "#fafbfc"
            : "white";
        }
      }}
    >
      <List.Item.Meta
        avatar={
          <Space size="middle">
            {/* Checkbox */}
            <Checkbox
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                handleSelectEmail(e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Star action - only show if star action is available */}
            {config.itemActions.includes("star") && (
              <Tooltip
                title={
                  email.is_starred ? "Hapus dari favorit" : "Tandai favorit"
                }
              >
                <Button
                  type="text"
                  size="small"
                  icon={
                    email.is_starred ? (
                      <StarFilled style={{ color: "#faad14" }} />
                    ) : (
                      <StarOutlined style={{ color: "#d9d9d9" }} />
                    )
                  }
                  onClick={handleStarClick}
                />
              </Tooltip>
            )}

            {/* Sender/Recipient avatar */}
            <Avatar
              src={
                config.showRecipient
                  ? email.recipients?.to?.[0]?.image
                  : email.sender_image
              }
              icon={<UserOutlined />}
              size="default"
            />
          </Space>
        }
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "16px",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Sender/Recipient name */}
              <div style={{ marginBottom: "4px" }}>
                <Space>
                  <Text
                    strong={showUnreadIndicator}
                    style={{
                      fontSize: "14px",
                      color: showUnreadIndicator ? "#262626" : "#595959",
                    }}
                  >
                    {getDisplayName()}
                  </Text>
                  {showUnreadIndicator && (
                    <Tag color={config.primaryColor} size="small">
                      BARU
                    </Tag>
                  )}
                  {config.showDraftBadge && (
                    <Tag color={config.primaryColor} size="small">
                      DRAFT
                    </Tag>
                  )}
                </Space>
              </div>

              {/* Subject */}
              <div style={{ marginBottom: "4px" }}>
                <Space>
                  <Text
                    strong={showUnreadIndicator}
                    style={{
                      fontSize: "16px",
                      color: showUnreadIndicator ? "#262626" : "#595959",
                      fontWeight: showUnreadIndicator ? 600 : 400,
                    }}
                  >
                    {email.subject || "(Tanpa Subjek)"}
                  </Text>
                  {email.attachment_count > 0 && (
                    <Tooltip title={`${email.attachment_count} lampiran`}>
                      <FileOutlined style={{ color: config.primaryColor }} />
                    </Tooltip>
                  )}
                </Space>
              </div>
            </div>

            {/* Time and actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Text
                type="secondary"
                style={{
                  fontSize: "13px",
                  whiteSpace: "nowrap",
                  minWidth: "fit-content",
                }}
              >
                {formatTime(email.created_at)}
              </Text>

              <Dropdown
                menu={{ items: getEmailActions(email) }}
                trigger={["click"]}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<MoreOutlined />}
                  onClick={(e) => e.stopPropagation()}
                  style={{ opacity: 0.7 }}
                />
              </Dropdown>
            </div>
          </div>
        }
        description={
          <Text
            type="secondary"
            style={{
              fontSize: "13px",
              lineHeight: "1.4",
              display: "block",
              marginTop: "4px",
            }}
          >
            {email.content?.substring(0, 120)}...
          </Text>
        }
      />
    </List.Item>
  );
};

export default EmailListItem;
