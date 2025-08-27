import { CrownOutlined, StarOutlined, TrophyOutlined } from "@ant-design/icons";
import { Avatar, Card, Empty, Flex, Grid, List, Tag, Typography } from "antd";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const Leaderboard = ({
  leaderboardData = [],
  currentUser,
  loading = false,
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <CrownOutlined style={{ color: "#FFD700", fontSize: "18px" }} />;
      case 2:
        return <CrownOutlined style={{ color: "#C0C0C0", fontSize: "16px" }} />;
      case 3:
        return <CrownOutlined style={{ color: "#CD7F32", fontSize: "16px" }} />;
      default:
        return (
          <span style={{ color: "#666", fontSize: "14px", fontWeight: "600" }}>
            #{rank}
          </span>
        );
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return "#FFD700";
      case 2:
        return "#C0C0C0";
      case 3:
        return "#CD7F32";
      default:
        return "#F0F0F0";
    }
  };

  const calcLevel = (points) => {
    return Math.floor(Math.sqrt(points / 50)) + 1;
  };

  // Add current user to data if not in top 10
  const processedData = leaderboardData?.data?.results || leaderboardData?.results || [];
  const userInTop10 = processedData.some(
    (user) => user.user_id === currentUser?.customId
  );

  return (
    <Card
      loading={loading}
      title={
        <Flex align="center" gap="small">
          <TrophyOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
          <Title
            level={isMobile ? 5 : 4}
            style={{ margin: 0, color: "#1A1A1B" }}
          >
            Leaderboard XP
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
        maxHeight: "400px",
        overflowY: "auto",
      }}
    >
      {processedData.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Text style={{ color: "#666" }}>
              Leaderboard belum tersedia.
              <br />
              Mulai kumpulkan XP untuk masuk ranking!
            </Text>
          }
          style={{ margin: "40px 0" }}
        />
      ) : (
        <>
          <List
            dataSource={processedData}
            renderItem={(user, index) => {
              const rank = index + 1;
              const level = calcLevel(user.points || 0);
              const isCurrentUser = user.user_id === currentUser?.customId;

              return (
                <List.Item
                  style={{
                    padding: isMobile ? "12px 0" : "16px 0",
                    borderBottom:
                      rank === processedData.length
                        ? "none"
                        : "1px solid #F0F0F0",
                    backgroundColor: isCurrentUser ? "#FFF7ED" : "transparent",
                    borderRadius: isCurrentUser ? "8px" : "0",
                    marginBottom: isCurrentUser ? "4px" : "0",
                    paddingLeft: isCurrentUser ? "12px" : "0",
                    paddingRight: isCurrentUser ? "12px" : "0",
                    border: isCurrentUser ? "1px solid #FED7AA" : "none",
                  }}
                >
                  <div style={{ width: "100%" }}>
                    <Flex align="center" justify="space-between" gap="medium">
                      {/* Rank & User Info */}
                      <Flex
                        align="center"
                        gap="medium"
                        style={{ flex: 1, minWidth: 0 }}
                      >
                        {/* Rank Badge */}
                        <div
                          style={{
                            minWidth: isMobile ? "32px" : "40px",
                            height: isMobile ? "32px" : "40px",
                            borderRadius: "50%",
                            backgroundColor: getRankBadgeColor(rank),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border:
                              rank <= 3
                                ? "2px solid white"
                                : "1px solid #E0E0E0",
                            boxShadow:
                              rank <= 3 ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                          }}
                        >
                          {getRankIcon(rank)}
                        </div>

                        {/* User Avatar & Info */}
                        <Flex
                          align="center"
                          gap="small"
                          style={{ flex: 1, minWidth: 0 }}
                        >
                          <Avatar
                            src={user.image}
                            size={isMobile ? 32 : 40}
                            style={{
                              border: isCurrentUser
                                ? "2px solid #FF4500"
                                : "1px solid #E0E0E0",
                            }}
                          >
                            {user.name?.charAt(0)?.toUpperCase()}
                          </Avatar>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Flex align="center" gap="small" wrap>
                              <Text
                                strong
                                style={{
                                  color: "#1A1A1B",
                                  fontSize: isMobile ? "14px" : "15px",
                                  maxWidth: isMobile ? "120px" : "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={user.name}
                              >
                                {user.name}
                              </Text>

                              {isCurrentUser && (
                                <Tag
                                  size="small"
                                  color="orange"
                                  style={{ fontSize: "10px" }}
                                >
                                  Anda
                                </Tag>
                              )}
                            </Flex>

                            <Text
                              style={{
                                color: "#666",
                                fontSize: isMobile ? "11px" : "12px",
                                display: "block",
                                marginTop: "2px",
                              }}
                            >
                              Level {level}
                            </Text>
                          </div>
                        </Flex>
                      </Flex>

                      {/* XP Points */}
                      <Flex
                        align="center"
                        gap="small"
                        style={{ flexShrink: 0 }}
                      >
                        <StarOutlined
                          style={{ color: "#FFD700", fontSize: "12px" }}
                        />
                        <Text
                          strong
                          style={{
                            color: "#1A1A1B",
                            fontSize: isMobile ? "13px" : "14px",
                            minWidth: isMobile ? "45px" : "60px",
                            textAlign: "right",
                          }}
                        >
                          {(user.points || 0).toLocaleString()}
                        </Text>
                      </Flex>
                    </Flex>
                  </div>
                </List.Item>
              );
            }}
          />

          {/* Current User Position (if not in top 10) */}
          {!userInTop10 && currentUser && (
            <>
              <div
                style={{
                  height: "1px",
                  backgroundColor: "#E0E0E0",
                  margin: "16px 0",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "white",
                    padding: "0 12px",
                    color: "#666",
                    fontSize: "11px",
                  }}
                >
                  ...
                </div>
              </div>

              <List.Item
                style={{
                  padding: isMobile ? "12px" : "16px",
                  backgroundColor: "#FFF7ED",
                  borderRadius: "8px",
                  border: "1px solid #FED7AA",
                }}
              >
                <div style={{ width: "100%" }}>
                  <Flex align="center" justify="space-between" gap="medium">
                    <Flex
                      align="center"
                      gap="medium"
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <div
                        style={{
                          minWidth: isMobile ? "32px" : "40px",
                          height: isMobile ? "32px" : "40px",
                          borderRadius: "50%",
                          backgroundColor: "#F0F0F0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          style={{
                            color: "#666",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          #{currentUser.rank || "?"}
                        </span>
                      </div>

                      <Flex
                        align="center"
                        gap="small"
                        style={{ flex: 1, minWidth: 0 }}
                      >
                        <Avatar
                          src={currentUser.image}
                          size={isMobile ? 32 : 40}
                          style={{ border: "2px solid #FF4500" }}
                        >
                          {currentUser.name?.charAt(0)?.toUpperCase()}
                        </Avatar>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Flex align="center" gap="small">
                            <Text
                              strong
                              style={{
                                color: "#1A1A1B",
                                fontSize: isMobile ? "14px" : "15px",
                              }}
                            >
                              {currentUser.name}
                            </Text>
                            <Tag
                              size="small"
                              color="orange"
                              style={{ fontSize: "10px" }}
                            >
                              Anda
                            </Tag>
                          </Flex>
                          <Text
                            style={{
                              color: "#666",
                              fontSize: isMobile ? "11px" : "12px",
                              display: "block",
                              marginTop: "2px",
                            }}
                          >
                            Level {calcLevel(currentUser.points || 0)}
                          </Text>
                        </div>
                      </Flex>
                    </Flex>

                    <Flex align="center" gap="small">
                      <StarOutlined
                        style={{ color: "#FFD700", fontSize: "12px" }}
                      />
                      <Text
                        strong
                        style={{
                          color: "#1A1A1B",
                          fontSize: isMobile ? "13px" : "14px",
                        }}
                      >
                        {(currentUser.points || 0).toLocaleString()}
                      </Text>
                    </Flex>
                  </Flex>
                </div>
              </List.Item>
            </>
          )}
        </>
      )}
    </Card>
  );
};

export default Leaderboard;
