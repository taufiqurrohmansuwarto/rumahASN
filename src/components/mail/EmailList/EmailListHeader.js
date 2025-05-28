// components/mail/EmailList/EmailListHeader.js
import { ReloadOutlined } from "@ant-design/icons";
import { Badge, Button, Card, Space, Tooltip, Typography } from "antd";
import ComposeButton from "@/components/mail/EmailCompose/ComposeButton";

const { Text, Title } = Typography;

const EmailListHeader = ({
  config,
  total = 0,
  unreadCount = 0,
  isLoading = false,
  onRefresh,
  onCompose,
}) => {
  const handleRefresh = () => {
    onRefresh?.();
  };

  const handleCompose = () => {
    onCompose?.();
  };

  return (
    <Card style={{ marginBottom: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "20px", color: config.primaryColor }}>
            {config.icon}
          </span>
          <Title level={4} style={{ margin: 0 }}>
            {config.subtitle}
          </Title>
          {config.showUnreadBadge && total > 0 && unreadCount > 0 && (
            <Badge
              count={unreadCount}
              style={{ backgroundColor: config.badgeColor }}
              showZero={false}
            />
          )}
          {total > 0 && <Text type="secondary">{total} email</Text>}
        </div>

        {/* Primary actions */}
        <Space>
          <ComposeButton onClick={handleCompose} />
          <Tooltip title={`Perbarui ${config.subtitle.toLowerCase()}`}>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={isLoading}
              size="large"
            />
          </Tooltip>
        </Space>
      </div>
    </Card>
  );
};

export default EmailListHeader;
