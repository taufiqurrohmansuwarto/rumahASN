import { useChannelMedia } from "@/hooks/useRasnChat";
import { Skeleton, Empty, Card as AntCard, Row, Col, Tabs } from "antd";
import { Text, Stack } from "@mantine/core";
import {
  IconPhoto,
  IconVideo,
  IconFile,
  IconMicrophone,
  IconFileText,
  IconFileSpreadsheet,
  IconPresentation,
  IconDownload,
} from "@tabler/icons-react";
import { useState } from "react";
import { formatFileSize } from "@/services/rasn-chat.services";
import dayjs from "dayjs";

const getTypeIcon = (type, mimeType) => {
  if (type === "image") return <IconPhoto size={32} color="#1890ff" />;
  if (type === "video") return <IconVideo size={32} color="#52c41a" />;
  if (type === "voice") return <IconMicrophone size={32} color="#faad14" />;
  if (type === "document") {
    if (mimeType?.includes("pdf")) return <IconFileText size={32} color="#ff4d4f" />;
    if (mimeType?.includes("word") || mimeType?.includes("document"))
      return <IconFileText size={32} color="#1890ff" />;
    if (mimeType?.includes("excel") || mimeType?.includes("spreadsheet"))
      return <IconFileSpreadsheet size={32} color="#52c41a" />;
    if (mimeType?.includes("powerpoint") || mimeType?.includes("presentation"))
      return <IconPresentation size={32} color="#fa8c16" />;
  }
  return <IconFile size={32} color="#999" />;
};

const MediaItem = ({ item }) => {
  const isImage = item.attachment_type === "image";
  const isVideo = item.attachment_type === "video";

  return (
    <AntCard
      size="small"
      hoverable
      style={{ height: "100%" }}
      cover={
        isImage ? (
          <a href={item.file_url} target="_blank" rel="noopener noreferrer">
            <div
              style={{
                height: 120,
                backgroundImage: `url(${item.thumbnail_url || item.file_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "#f5f5f5",
              }}
            />
          </a>
        ) : isVideo ? (
          <a href={item.file_url} target="_blank" rel="noopener noreferrer">
            <div
              style={{
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#000",
                position: "relative",
              }}
            >
              <IconVideo size={40} color="#fff" />
            </div>
          </a>
        ) : (
          <a href={item.file_url} target="_blank" rel="noopener noreferrer">
            <div
              style={{
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fafafa",
              }}
            >
              {getTypeIcon(item.attachment_type, item.file_type)}
            </div>
          </a>
        )
      }
      actions={[
        <a key="download" href={item.file_url} target="_blank" rel="noopener noreferrer">
          <IconDownload size={14} />
        </a>,
      ]}
    >
      <AntCard.Meta
        title={
          <Text size="xs" truncate title={item.file_name}>
            {item.file_name}
          </Text>
        }
        description={
          <Text size="xs" c="dimmed">
            {formatFileSize(item.file_size)} • {dayjs(item.created_at).format("DD MMM")}
          </Text>
        }
      />
    </AntCard>
  );
};

const MediaContent = ({ channelId, type }) => {
  const { data, isLoading } = useChannelMedia(channelId, {
    type: type === "all" ? null : type,
    page: 1,
    limit: 50,
  });

  const media = data?.results || [];

  if (isLoading) return <Skeleton active paragraph={{ rows: 4 }} />;

  if (!media.length) {
    return <Empty description="Tidak ada media" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <Stack gap="md">
      <Row gutter={[12, 12]}>
        {media.map((item) => (
          <Col key={item.id} xs={12} sm={8} md={6} lg={4}>
            <MediaItem item={item} />
          </Col>
        ))}
      </Row>
      <Text size="xs" c="dimmed" ta="center">
        Menampilkan {media.length} file
      </Text>
    </Stack>
  );
};

const MediaGallery = ({ channelId }) => {
  const [activeTab, setActiveTab] = useState("all");

  const tabItems = [
    {
      key: "all",
      label: (
        <span>
          <IconFile size={14} style={{ marginRight: 4 }} />
          Semua
        </span>
      ),
      children: <MediaContent channelId={channelId} type="all" />,
    },
    {
      key: "image",
      label: (
        <span>
          <IconPhoto size={14} style={{ marginRight: 4 }} />
          Gambar
        </span>
      ),
      children: <MediaContent channelId={channelId} type="image" />,
    },
    {
      key: "video",
      label: (
        <span>
          <IconVideo size={14} style={{ marginRight: 4 }} />
          Video
        </span>
      ),
      children: <MediaContent channelId={channelId} type="video" />,
    },
    {
      key: "document",
      label: (
        <span>
          <IconFileText size={14} style={{ marginRight: 4 }} />
          Dokumen
        </span>
      ),
      children: <MediaContent channelId={channelId} type="document" />,
    },
    {
      key: "voice",
      label: (
        <span>
          <IconMicrophone size={14} style={{ marginRight: 4 }} />
          Voice
        </span>
      ),
      children: <MediaContent channelId={channelId} type="voice" />,
    },
  ];

  return (
    <Tabs
      activeKey={activeTab}
      onChange={setActiveTab}
      items={tabItems}
      size="small"
    />
  );
};

export default MediaGallery;
