import { CrownOutlined, StarOutlined, TrophyOutlined } from "@ant-design/icons";
import { Avatar, Card, Empty, List, Tag, Typography, Grid, Flex } from "antd";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const Leaderboard = ({
  leaderboardData = [],
  currentUser,
  loading = false,
}) => {
  const screens = useBreakpoint();

  const getRankIcon = (rank) => {
    if (rank === 1) return <CrownOutlined style={{ color: "#FFD700" }} />;
    if (rank === 2) return <CrownOutlined style={{ color: "#C0C0C0" }} />;
    if (rank === 3) return <CrownOutlined style={{ color: "#CD7F32" }} />;
    return <Text strong>#{rank}</Text>;
  };

  const calcLevel = (points) => {
    return Math.floor(Math.sqrt(points / 50)) + 1;
  };

  // Extract leaderboard data
  const processedData = leaderboardData?.data?.results || leaderboardData?.results || [];

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
        <div style={{ flex: 1, maxHeight: "400px", overflowY: "auto" }}>
          <div style={{ padding: "16px 16px 8px 16px" }}>
            <Text strong style={{ fontSize: "16px", color: "#1A1A1B" }}>
              Leaderboard XP
            </Text>
          </div>
          
          {processedData.length === 0 ? (
            <div style={{ padding: "16px" }}>
              <Empty description="Leaderboard belum tersedia" />
            </div>
          ) : (
            <List
              dataSource={processedData}
              renderItem={(user, index) => {
                const rank = index + 1;
                const level = calcLevel(user.points || 0);
                const isCurrentUser = user.user_id === currentUser?.customId;

                return (
                  <List.Item
                    style={{
                      display: "flex", 
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 16px",
                      backgroundColor: isCurrentUser ? "#FFF7ED" : "transparent",
                      border: isCurrentUser ? "1px solid #FED7AA" : "none",
                      borderRadius: isCurrentUser ? "4px" : "0",
                      margin: isCurrentUser ? "4px 12px" : "0",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentUser) {
                        e.currentTarget.style.backgroundColor = "#FAFAFA";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentUser) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <Flex align="center" gap="12px" style={{ flex: 1 }}>
                      {/* Rank */}
                      <div style={{ 
                        width: "32px", 
                        height: "32px", 
                        borderRadius: "50%", 
                        backgroundColor: "#f0f0f0",
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center" 
                      }}>
                        {getRankIcon(rank)}
                      </div>
                      
                      {/* Avatar */}
                      <Avatar size={32} src={user.image}>
                        {user.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      
                      {/* User Info */}
                      <div style={{ flex: 1 }}>
                        <Flex align="center" gap="8px">
                          <Text 
                            strong 
                            ellipsis 
                            style={{ 
                              maxWidth: screens.md ? "120px" : "80px",
                              color: "#1A1A1B"
                            }}
                          >
                            {user.name}
                          </Text>
                          {isCurrentUser && <Tag size="small" color="orange">Anda</Tag>}
                        </Flex>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          Level {level}
                        </Text>
                      </div>
                    </Flex>
                    
                    {/* Points */}
                    <Flex align="center" gap="4px">
                      <StarOutlined style={{ color: "#FFD700" }} />
                      <Text strong style={{ color: "#1A1A1B" }}>
                        {(user.points || 0).toLocaleString()}
                      </Text>
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

export default Leaderboard;
