import AvatarUser from "@/components/Users/AvatarUser";
import { useTopContributors } from "@/hooks/knowledge-management/useKnowledgeInsights";
import { TrophyOutlined } from "@ant-design/icons";
import { Badge, Card, Flex, Grid, List, Skeleton, Typography } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import UserText from "../Users/UserText";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const ContributorItem = ({ contributor, rank, isMobile }) => {
  const { user, stats } = contributor;

  const getRankEmoji = (rank) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `${rank}`;
    }
  };

  return (
    <List.Item
      style={{
        padding: isMobile ? "4px 0" : "6px 0",
        borderBottom: "1px solid #f5f5f5",
      }}
    >
      <List.Item.Meta
        avatar={
          <AvatarUser
            src={user?.image}
            userId={user?.custom_id}
            user={user}
            size="small"
          />
        }
        title={
          <Flex justify="space-between" align="center">
            <UserText userId={user?.custom_id} text={user?.username}>
              {user?.username || user?.nama}
            </UserText>
            <span style={{ fontSize: "14px" }}>{getRankEmoji(rank)}</span>
          </Flex>
        }
        description={
          <Text style={{ fontSize: "10px" }} type="secondary">
            {stats.total_contents} konten • {stats.total_likes} suka
          </Text>
        }
      />
    </List.Item>
  );
};

function TopContributors({ period = "month", limit = 10 }) {
  const { data, isLoading, error } = useTopContributors({ period, limit });

  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const mainPadding = isMobile ? "12px" : "16px";
  const iconSectionWidth = isMobile ? "0px" : "40px";

  if (error) {
    return null;
  }

  return (
    <>
      {(data?.contributors?.length > 0 || isLoading) && (
        <div>
          <Badge.Ribbon text="Galeri Kehormatan" color="primary">
            <Card
              style={{
                width: "100%",
                marginBottom: "16px",
              }}
              styles={{ body: { padding: 0 } }}
            >
              <Flex>
                {/* Icon Section - Hide on mobile */}
                {!isMobile && (
                  <div
                    style={{
                      width: iconSectionWidth,
                      backgroundColor: "#F8F9FA",
                      borderRight: "1px solid #E5E7EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "200px",
                    }}
                  >
                    <TrophyOutlined
                      style={{ color: "#8C8C8C", fontSize: "18px" }}
                    />
                  </div>
                )}

                {/* Content Section */}
                <div style={{ flex: 1, padding: mainPadding }}>
                  {/* Header */}
                  <div style={{ marginBottom: "16px" }}>
                    <Title
                      level={5}
                      style={{
                        margin: 0,
                        color: "#1C1C1C",
                        fontSize: isMobile ? "16px" : "18px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      🏆 Kontributor Terbaik
                    </Title>
                    <Text
                      style={{
                        color: "#878A8C",
                        fontSize: isMobile ? "12px" : "14px",
                      }}
                    >
                      Kontributor terbaik periode{" "}
                      {period === "month"
                        ? "bulan ini"
                        : period === "week"
                        ? "minggu ini"
                        : period === "quarter"
                        ? "kuartal ini"
                        : period === "year"
                        ? "tahun ini"
                        : "semua waktu"}
                    </Text>
                  </div>

                  {/* Contributors List */}
                  <div>
                    {isLoading ? (
                      <div>
                        {[...Array(5)].map((_, index) => (
                          <div key={index} style={{ marginBottom: "16px" }}>
                            <Skeleton.Input
                              style={{ width: "100%", height: "60px" }}
                              active
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <List
                        dataSource={data?.contributors || []}
                        split={false}
                        renderItem={(contributor, index) => (
                          <ContributorItem
                            key={contributor.user?.id}
                            contributor={contributor}
                            rank={index + 1}
                            isMobile={isMobile}
                          />
                        )}
                      />
                    )}
                  </div>
                </div>
              </Flex>
            </Card>
          </Badge.Ribbon>
        </div>
      )}
    </>
  );
}

export default TopContributors;
