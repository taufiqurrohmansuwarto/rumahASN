import AvatarUser from "@/components/Users/AvatarUser";
import { useTopContributors } from "@/hooks/knowledge-management/useKnowledgeInsights";
import { Card, Flex, Grid, List, Skeleton, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import UserText from "../Users/UserText";

dayjs.extend(relativeTime);

const { Text } = Typography;
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
  const isMobile = screens.xs;
  const mainPadding = isMobile ? "12px" : "16px";

  if (error) {
    return null;
  }

  return (
    <>
      {(data?.contributors?.length > 0 || isLoading) && (
        <div>
          <Card
            style={{
              width: "100%",
              marginBottom: "16px",
            }}
            styles={{ body: { padding: 0 } }}
          >
            {/* Content Section */}
            <div style={{ padding: mainPadding }}>
              {/* Header */}
              <div style={{ marginBottom: "16px" }}>
                <Tooltip
                  title={`Kontributor terbaik periode ${
                    period === "month"
                      ? "bulan ini"
                      : period === "week"
                      ? "minggu ini"
                      : period === "quarter"
                      ? "kuartal ini"
                      : period === "year"
                      ? "tahun ini"
                      : "semua waktu"
                  }`}
                >
                  <Text
                    strong
                    style={{
                      margin: 0,
                      color: "#1C1C1C",
                      fontSize: isMobile ? "12px" : "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "help",
                    }}
                  >
                    🏆 Kontributor Terbaik
                  </Text>
                </Tooltip>
              </div>

              {/* Contributors List */}
              <div>
                {isLoading ? (
                  <div>
                    {[...Array(5)].map((_, index) => (
                      <div key={index} style={{ marginBottom: "16px" }}>
                        <Skeleton.Input
                          style={{ width: "100%", height: "35px" }}
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
          </Card>
        </div>
      )}
    </>
  );
}

export default TopContributors;
