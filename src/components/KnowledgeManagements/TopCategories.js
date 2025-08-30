import React from "react";
import {
  Card,
  Typography,
  Badge,
  Skeleton,
  Flex,
  Grid,
  List,
  Progress,
} from "antd";
import {
  FolderOutlined,
  BarChartOutlined,
  FileTextOutlined,
  LikeOutlined,
  EyeOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useTopCategories } from "@/hooks/knowledge-management/useKnowledgeInsights";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const CategoryItem = ({ category, rank, isMobile, maxContentCount }) => {
  const { category: categoryInfo, stats } = category;

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

  const getProgressPercent = (count) => {
    return maxContentCount > 0
      ? Math.round((count / maxContentCount) * 100)
      : 0;
  };

  return (
    <List.Item
      style={{
        padding: isMobile ? "12px 0" : "16px 0",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <List.Item.Meta
        avatar={
          <Badge
            count={rank}
            style={{
              backgroundColor: getRankColor(rank),
              color: rank <= 3 ? "#fff" : "#000",
              fontWeight: "bold",
            }}
          >
            <div
              style={{
                width: isMobile ? 40 : 48,
                height: isMobile ? 40 : 48,
                borderRadius: "8px",
                backgroundColor: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isMobile ? "16px" : "20px",
              }}
            >
              <FolderOutlined style={{ color: "#8C8C8C" }} />
            </div>
          </Badge>
        }
        title={
          <div>
            <Text
              strong
              style={{
                fontSize: isMobile ? "14px" : "16px",
                lineHeight: "1.4",
                display: "block",
                marginBottom: "4px",
              }}
            >
              {categoryInfo?.name}
            </Text>
            {categoryInfo?.description && (
              <Text
                style={{
                  fontSize: isMobile ? "11px" : "12px",
                  color: "#8c8c8c",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {categoryInfo.description}
              </Text>
            )}
          </div>
        }
        description={
          <Text style={{ fontSize: "10px" }} type="secondary">
            {stats.content_count} konten • {stats.total_likes} suka
          </Text>
        }
      />
    </List.Item>
  );
};

function TopCategories({
  period = "month",
  sortBy = "content_count",
  limit = 10,
}) {
  const { data, isLoading, error } = useTopCategories({
    period,
    sortBy,
    limit,
  });

  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const mainPadding = isMobile ? "12px" : "16px";
  const iconSectionWidth = isMobile ? "0px" : "40px";

  const getSortByLabel = (sortBy) => {
    switch (sortBy) {
      case "engagement":
        return "paling engaging";
      case "activity":
        return "paling aktif";
      case "content_count":
      default:
        return "terbanyak kontennya";
    }
  };

  // Calculate max content count for progress bars
  const maxContentCount =
    data?.categories?.length > 0
      ? Math.max(...data.categories.map((cat) => cat.stats.content_count))
      : 0;

  if (error) {
    return null;
  }

  return (
    <>
      {(data?.categories?.length > 0 || isLoading) && (
        <div>
          <Badge.Ribbon text="Kategori Populer" color="primary">
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
                    <BarChartOutlined
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
                      📁 Kategori Populer
                    </Title>
                    <Text
                      style={{
                        color: "#878A8C",
                        fontSize: isMobile ? "12px" : "14px",
                      }}
                    >
                      Kategori {getSortByLabel(sortBy)} periode{" "}
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

                  {/* Categories List */}
                  <div>
                    {isLoading ? (
                      <div>
                        {[...Array(5)].map((_, index) => (
                          <div key={index} style={{ marginBottom: "16px" }}>
                            <Skeleton.Input
                              style={{ width: "100%", height: "70px" }}
                              active
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <List
                        dataSource={data?.categories || []}
                        split={false}
                        renderItem={(category, index) => (
                          <CategoryItem
                            key={category.category?.id}
                            category={category}
                            rank={index + 1}
                            isMobile={isMobile}
                            maxContentCount={maxContentCount}
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

export default TopCategories;
