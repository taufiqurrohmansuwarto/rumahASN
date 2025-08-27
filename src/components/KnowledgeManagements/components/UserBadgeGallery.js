import React from "react";
import { Card, Typography, Empty, Avatar, Flex, List } from "antd";
import { TrophyOutlined, StarOutlined, CrownOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const UserBadgeGallery = ({ userBadges, loading = false }) => {
  // Extract badges from response data format
  const badgesData = userBadges?.data || [];

  const getBadgeIcon = (badgeType) => {
    switch (badgeType) {
      case "level":
        return <StarOutlined />;
      case "achievement":
        return <TrophyOutlined />;
      default:
        return <CrownOutlined />;
    }
  };

  return (
    <Card
      loading={loading}
      style={{
        marginBottom: "16px",
        padding: 0,
        overflow: "hidden",
        transition: "border-color 0.2s ease",
      }}
      styles={{ body: { padding: 0 } }}
      hoverable
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#898989";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#EDEFF1";
      }}
    >
      <Flex style={{ minHeight: "60px" }}>
        {/* Icon Section */}
        <div
          style={{
            width: "60px",
            backgroundColor: "#F8F9FA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRight: "1px solid #EDEFF1",
          }}
        >
          <TrophyOutlined
            style={{
              fontSize: 20,
              color: "#FF4500",
            }}
          />
        </div>

        {/* Content Section */}
        <div style={{ flex: 1, padding: "16px" }}>
          <Text
            strong
            style={{
              fontSize: "16px",
              color: "#1A1A1B",
              marginBottom: "16px",
              display: "block",
            }}
          >
            Koleksi Badge ({badgesData.length})
          </Text>

          {badgesData.length === 0 ? (
            <Empty description="Belum ada badge yang didapat" />
          ) : (
            <List
              dataSource={badgesData}
              renderItem={(userBadge, index) => {
                const badge = userBadge.badge || userBadge;
                const badgeType = badge.badge_type || "achievement";

                return (
                  <List.Item
                    key={userBadge.id || index}
                    style={{
                      padding: "12px 0",
                      borderBottom: "1px solid #F0F0F0",
                      transition: "background-color 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#FAFAFA";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Flex align="center" gap="12px" style={{ width: "100%" }}>
                      {/* Badge Avatar */}
                      <div style={{ flexShrink: 0 }}>
                        {badge.icon_url ? (
                          <Avatar src={badge.icon_url} size={48} />
                        ) : (
                          <Avatar 
                            size={48} 
                            icon={getBadgeIcon(badgeType)} 
                            style={{ backgroundColor: "#FF4500" }}
                          />
                        )}
                      </div>

                      {/* Badge Info */}
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ 
                          color: "#1A1A1B", 
                          fontSize: "14px",
                          display: "block",
                          marginBottom: "4px"
                        }}>
                          {badge.name}
                        </Text>
                        
                        {badge.description && (
                          <Text type="secondary" style={{ 
                            fontSize: "12px",
                            display: "block",
                            marginBottom: "4px"
                          }}>
                            {badge.description}
                          </Text>
                        )}

                        <Flex align="center" gap="8px" wrap>
                          {badge.points_required > 0 && (
                            <Text type="secondary" style={{ fontSize: "11px" }}>
                              🎯 {badge.points_required} XP Required
                            </Text>
                          )}
                          
                          <Text type="success" style={{ fontSize: "11px" }}>
                            🏆 Didapat: {new Date(userBadge.awarded_at).toLocaleDateString("id-ID")}
                          </Text>
                        </Flex>
                      </div>
                    </Flex>
                  </List.Item>
                );
              }}
            />
          )}
        </div>
      </Flex>
    </Card>
  );
};

export default UserBadgeGallery;
