import {
  Card,
  Grid,
  List,
  Skeleton,
  Typography,
  Tooltip,
} from "antd";

import { useTopContents } from "@/hooks/knowledge-management/useKnowledgeInsights";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";

dayjs.extend(relativeTime);

const { Text } = Typography;
const { useBreakpoint } = Grid;

const ContentItem = ({ content, isMobile }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/knowledge-management/contents/${content.id}`);
  };

  return (
    <List.Item
      style={{
        padding: isMobile ? "6px 0" : "8px 0",
        cursor: "pointer",
      }}
      onClick={handleClick}
    >
      <List.Item.Meta
avatar={null}
        title={
          <Text
            strong
            style={{
              fontSize: isMobile ? "11px" : "12px",
              lineHeight: "1.3",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {content.title}
          </Text>
        }
      />
    </List.Item>
  );
};

function TopContents({ period = "month", sortBy = "likes", limit = 10 }) {
  const { data, isLoading, error } = useTopContents({ period, sortBy, limit });

  const screens = useBreakpoint();
  const isMobile = screens.xs;
  const mainPadding = isMobile ? "12px" : "16px";

  const getSortByLabel = (sortBy) => {
    switch (sortBy) {
      case "views":
        return "paling dilihat";
      case "comments":
        return "paling dikomentari";
      case "engagement":
        return "paling engaging";
      case "likes":
      default:
        return "paling disukai";
    }
  };

  if (error) {
    return null;
  }

  return (
    <>
      {(data?.contents?.length > 0 || isLoading) && (
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
                    title={`Konten ${getSortByLabel(sortBy)} periode ${
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
                      🔥 Konten Populer
                    </Text>
                  </Tooltip>
                </div>

                {/* Contents List */}
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
                      dataSource={data?.contents || []}
                      split={false}
                      renderItem={(content, index) => (
                        <ContentItem
                          key={content.id}
                          content={content}
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

export default TopContents;
