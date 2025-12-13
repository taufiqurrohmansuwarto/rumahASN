import { useChannelMedia } from "@/hooks/useRasnChat";
import { Skeleton, Segmented, Empty } from "antd";
import { SimpleGrid, Card, Image, Text, Group, Box, Paper } from "@mantine/core";
import { IconPhoto, IconVideo, IconFile, IconMicrophone } from "@tabler/icons-react";
import { useState } from "react";
import { formatFileSize } from "@/services/rasn-chat.services";
import dayjs from "dayjs";

const getTypeIcon = (type) => {
  if (type === "image") return <IconPhoto size={24} />;
  if (type === "video") return <IconVideo size={24} />;
  if (type === "voice") return <IconMicrophone size={24} />;
  return <IconFile size={24} />;
};

const MediaGallery = ({ channelId }) => {
  const [type, setType] = useState("all");
  const { data, isLoading } = useChannelMedia(channelId, {
    type: type === "all" ? null : type,
    page: 1,
    limit: 50,
  });

  const media = data?.results || [];

  if (isLoading) return <Skeleton active paragraph={{ rows: 4 }} />;

  return (
    <div>
      <Segmented
        value={type}
        onChange={setType}
        options={[
          { value: "all", label: "Semua" },
          { value: "image", label: "Gambar" },
          { value: "video", label: "Video" },
          { value: "document", label: "Dokumen" },
          { value: "voice", label: "Voice" },
        ]}
        style={{ marginBottom: 16 }}
        size="small"
      />

      {!media.length ? (
        <Box ta="center" py="xl">
          <Text c="dimmed">Tidak ada media</Text>
        </Box>
      ) : (
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="xs">
          {media.map((item) => (
            <Card key={item.id} padding="xs" withBorder>
              {item.attachment_type === "image" ? (
                <Card.Section>
                  <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                    <Image
                      src={item.thumbnail_url || item.file_url}
                      alt={item.file_name}
                      h={100}
                      fit="cover"
                    />
                  </a>
                </Card.Section>
              ) : (
                <Box
                  h={100}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  {getTypeIcon(item.attachment_type)}
                </Box>
              )}
              <Text size="xs" truncate mt="xs" fw={500}>{item.file_name}</Text>
              <Group gap={4}>
                <Text size="xs" c="dimmed">{formatFileSize(item.file_size)}</Text>
                <Text size="xs" c="dimmed">•</Text>
                <Text size="xs" c="dimmed">{dayjs(item.created_at).format("DD MMM")}</Text>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </div>
  );
};

export default MediaGallery;
