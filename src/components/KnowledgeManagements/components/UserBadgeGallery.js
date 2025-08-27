import React from "react";
import { Card, Typography, Empty, Flex, Grid, Avatar, Tooltip } from "antd";
import { TrophyOutlined, StarOutlined, CrownOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const UserBadgeGallery = ({ userBadges, loading = false }) => {
  // Extract badges from response data format
  const badgesData = userBadges?.data || [];
  const screens = useBreakpoint();
  const isMobile = !screens.md;

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

  const getBadgeColor = (badgeType) => {
    switch (badgeType) {
      case "level":
        return "#1890FF";
      case "achievement":
        return "#52C41A";
      default:
        return "#FF4500";
    }
  };

  return (
    <Card
      loading={loading}
      title={
        <Flex align="center" gap="small">
          <TrophyOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
          <Title level={isMobile ? 5 : 4} style={{ margin: 0, color: "#1A1A1B" }}>
            Koleksi Badge ({badgesData.length})
          </Title>
        </Flex>
      }
      style={{
        borderRadius: "12px",
        border: "1px solid #EDEFF1",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      }}
      bodyStyle={{
        padding: isMobile ? "16px" : "20px",
        minHeight: "200px",
      }}
    >
      {badgesData.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Text style={{ color: "#666" }}>
              Belum ada badge yang didapat.
              <br />
              Tetap aktif untuk mendapatkan badge pertama!
            </Text>
          }
          style={{ margin: "40px 0" }}
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile 
              ? "repeat(auto-fill, minmax(80px, 1fr))"
              : "repeat(auto-fill, minmax(100px, 1fr))",
            gap: isMobile ? "12px" : "16px",
            justifyItems: "center",
          }}
        >
          {badgesData.map((userBadge, index) => {
            const badge = userBadge.badge || userBadge;
            const badgeType = badge.badge_type || "achievement";
            
            return (
              <Tooltip
                key={userBadge.id || index}
                title={
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                      {badge.name}
                    </div>
                    {badge.description && (
                      <div style={{ fontSize: "12px", opacity: 0.8 }}>
                        {badge.description}
                      </div>
                    )}
                    {badge.points_required > 0 && (
                      <div style={{ fontSize: "12px", marginTop: "4px", color: "#FFD700" }}>
                        {badge.points_required} XP Required
                      </div>
                    )}
                    <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.7 }}>
                      Didapat: {new Date(userBadge.awarded_at).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                }
                placement="top"
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    border: "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F8F9FA";
                    e.currentTarget.style.borderColor = getBadgeColor(badgeType);
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "transparent";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {badge.icon_url ? (
                    <Avatar
                      src={badge.icon_url}
                      size={isMobile ? 48 : 56}
                      style={{
                        border: `2px solid ${getBadgeColor(badgeType)}`,
                        marginBottom: "6px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: isMobile ? "48px" : "56px",
                        height: isMobile ? "48px" : "56px",
                        borderRadius: "50%",
                        backgroundColor: getBadgeColor(badgeType),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: isMobile ? "20px" : "24px",
                        marginBottom: "6px",
                        boxShadow: `0 2px 8px ${getBadgeColor(badgeType)}40`,
                      }}
                    >
                      {getBadgeIcon(badgeType)}
                    </div>
                  )}
                  
                  <Text
                    style={{
                      fontSize: isMobile ? "11px" : "12px",
                      fontWeight: "600",
                      textAlign: "center",
                      color: "#1A1A1B",
                      lineHeight: "1.2",
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {badge.name}
                  </Text>
                </div>
              </Tooltip>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default UserBadgeGallery;