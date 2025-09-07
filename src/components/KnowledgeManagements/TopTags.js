import React from "react";
import {
  Card,
  Typography,
  Badge,
  Skeleton,
  Flex,
  Grid,
  Tag,
  Progress,
  Tooltip,
} from "antd";
import {
  TagsOutlined,
} from "@ant-design/icons";
import { useTopTags } from "@/hooks/knowledge-management/useKnowledgeInsights";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const TagItem = ({ tagData, rank, isMobile, maxUsageCount }) => {
  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "#FFD700";
      case 2:
        return "#C0C0C0";
      case 3:
        return "#CD7F32";
      default:
        return "#8C8C8C";
    }
  };

  const getTagSize = (rank) => {
    if (rank <= 3) return "small";
    if (rank <= 10) return "small";
    return "small";
  };

  const getProgressPercent = (count) => {
    return maxUsageCount > 0 ? Math.round((count / maxUsageCount) * 100) : 0;
  };

  const getTagColor = (rank) => {
    if (rank === 1) return "gold";
    if (rank === 2) return "cyan";
    if (rank === 3) return "purple";
    if (rank <= 5) return "orange";
    if (rank <= 10) return "blue";
    return "default";
  };

  return (
    <div
      style={{
        padding: isMobile ? "6px 0" : "8px 0",
      }}
    >
      <Flex justify="space-between" align="flex-start" gap="6px">
        {/* Tag with Rank */}
        <Flex align="center" gap="4px" style={{ flex: 1 }}>
          <Badge
            count={rank}
            style={{
              backgroundColor: getRankColor(rank),
              color: rank <= 3 ? "#fff" : "#000",
              fontWeight: "bold",
              fontSize: "8px",
            }}
            size="small"
          >
            <Tag
              size={getTagSize(rank)}
              color={getTagColor(rank)}
              style={{
                fontSize: isMobile ? "10px" : "11px",
                fontWeight: rank <= 5 ? "bold" : "normal",
                margin: 0,
              }}
            >
              <TagsOutlined style={{ marginRight: "1px", fontSize: "8px" }} />
              {tagData.tag}
            </Tag>
          </Badge>
        </Flex>

        {/* Stats */}
        <Text
          style={{
            fontSize: "9px",
            color: "#666666",
          }}
        >
          {tagData.usage_count}×
        </Text>
      </Flex>
    </div>
  );
};

function TopTags({ period = "month", sortBy = "usage_count", limit = 20 }) {
  const { data, isLoading, error } = useTopTags({ period, sortBy, limit });

  const screens = useBreakpoint();
  const isMobile = screens.xs;
  const mainPadding = isMobile ? "12px" : "16px";

  const getSortByLabel = (sortBy) => {
    switch (sortBy) {
      case "engagement":
        return "paling engaging";
      case "recent":
        return "paling baru digunakan";
      case "usage_count":
      default:
        return "paling sering digunakan";
    }
  };

  // Calculate max usage count for progress bars
  const maxUsageCount =
    data?.tags?.length > 0
      ? Math.max(...data.tags.map((tag) => tag.usage_count))
      : 0;

  if (error) {
    return null;
  }

  return (
    <>
      {(data?.tags?.length > 0 || isLoading) && (
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
                  <Flex justify="space-between" align="center">
                    <Tooltip
                      title={`Tag ${getSortByLabel(sortBy)} periode ${
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
                        🏷️ Tag Populer
                      </Text>
                    </Tooltip>
                    {data?.total_unique_tags && (
                      <Text style={{ fontSize: "11px" }} type="secondary">
                        {data.total_unique_tags} total tag unik
                      </Text>
                    )}
                  </Flex>
                </div>

                {/* Tags List */}
                <div
                  style={{
                    maxHeight: isMobile ? "400px" : "500px",
                    overflowY: "auto",
                  }}
                >
                  {isLoading ? (
                    <div>
                      {[...Array(10)].map((_, index) => (
                        <div key={index} style={{ marginBottom: "12px" }}>
                          <Skeleton.Input
                            style={{ width: "100%", height: "30px" }}
                            active
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      {data?.tags?.map((tagData, index) => (
                        <TagItem
                          key={`${tagData.tag}-${index}`}
                          tagData={tagData}
                          rank={index + 1}
                          isMobile={isMobile}
                          maxUsageCount={maxUsageCount}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
          </Card>
        </div>
      )}
    </>
  );
}

export default TopTags;
