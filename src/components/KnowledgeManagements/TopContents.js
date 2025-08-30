import React from "react";
import { Card, Typography, Badge, Skeleton, Flex, Grid, List } from "antd";
import {
  FileTextOutlined,
  FireOutlined,
  LikeOutlined,
  EyeOutlined,
  MessageOutlined,
  PlayCircleOutlined,
  FileImageOutlined,
  SoundOutlined,
} from "@ant-design/icons";

import { useTopContents } from "@/hooks/knowledge-management/useKnowledgeInsights";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const ContentItem = ({ content, rank, isMobile }) => {
  const router = useRouter();

  const getTypeIcon = (type) => {
    switch (type) {
      case "artikel":
        return <FileTextOutlined style={{ color: "#1890ff" }} />;
      case "video":
        return <PlayCircleOutlined style={{ color: "#ff4d4f" }} />;
      case "gambar":
        return <FileImageOutlined style={{ color: "#52c41a" }} />;
      case "audio":
        return <SoundOutlined style={{ color: "#722ed1" }} />;
      default:
        return <FileTextOutlined style={{ color: "#8c8c8c" }} />;
    }
  };

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

  const handleClick = () => {
    router.push(`/knowledge-management/contents/${content.id}`);
  };

  return (
    <List.Item
      style={{
        padding: isMobile ? "6px 0" : "8px 0",
        borderBottom: "1px solid #f0f0f0",
        cursor: "pointer",
      }}
      onClick={handleClick}
      className="hover:bg-gray-50 transition-colors duration-200"
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
                width: isMobile ? 28 : 32,
                height: isMobile ? 28 : 32,
                borderRadius: "4px",
                backgroundColor: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isMobile ? "10px" : "12px",
              }}
            >
              {getTypeIcon(content.type)}
            </div>
          </Badge>
        }
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
        description={
          <Text style={{ fontSize: "10px" }} type="secondary">
            {content.likes_count || 0} suka • {content.views_count || 0} dilihat
          </Text>
        }
      />
    </List.Item>
  );
};

function TopContents({ period = "month", sortBy = "likes", limit = 10 }) {
  const { data, isLoading, error } = useTopContents({ period, sortBy, limit });

  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const mainPadding = isMobile ? "12px" : "16px";
  const iconSectionWidth = isMobile ? "0px" : "40px";

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
          <Badge.Ribbon text="Konten Populer" color="primary">
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
                    <FireOutlined
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
                      🔥 Konten Populer
                    </Title>
                    <Text
                      style={{
                        color: "#878A8C",
                        fontSize: isMobile ? "12px" : "14px",
                      }}
                    >
                      Konten {getSortByLabel(sortBy)} periode{" "}
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

                  {/* Contents List */}
                  <div>
                    {isLoading ? (
                      <div>
                        {[...Array(5)].map((_, index) => (
                          <div key={index} style={{ marginBottom: "16px" }}>
                            <Skeleton.Input
                              style={{ width: "100%", height: "80px" }}
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

export default TopContents;
