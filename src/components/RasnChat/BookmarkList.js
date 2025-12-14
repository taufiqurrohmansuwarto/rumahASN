import { useMyBookmarks, useToggleBookmark } from "@/hooks/useRasnChat";
import { Avatar, Box, Group, Paper, Stack, Text } from "@mantine/core";
import {
  IconBookmark,
  IconBookmarkOff,
  IconHash,
  IconLock,
  IconMessage,
} from "@tabler/icons-react";
import { Button, Empty, Input, Pagination, Skeleton, Tooltip } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

dayjs.extend(relativeTime);
dayjs.locale("id");

const BookmarkList = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useMyBookmarks({ page, limit: 20, search });
  const toggleBookmark = useToggleBookmark();

  const bookmarks = data?.results || [];
  const total = data?.total || 0;

  const handleRemoveBookmark = (messageId) => {
    toggleBookmark.mutate({ messageId });
  };

  const handleNavigateToMessage = (bookmark) => {
    const channelId = bookmark.message?.channel?.id;
    const messageId = bookmark.message?.id;
    if (channelId && messageId) {
      router.push(`/rasn-chat/${channelId}?scrollTo=${messageId}`);
    }
  };

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 5 }} />;
  }

  return (
    <Stack gap="md">
      {/* Search */}
      <Input.Search
        placeholder="Cari pesan yang disimpan..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        allowClear
      />

      {/* Bookmark List */}
      {bookmarks.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            search
              ? "Tidak ada hasil pencarian"
              : "Belum ada pesan yang disimpan"
          }
        />
      ) : (
        <Stack gap="sm">
          {bookmarks.map((bookmark) => {
            const message = bookmark.message;
            const channel = message?.channel;

            return (
              <Paper
                key={bookmark.id}
                withBorder
                p="sm"
                radius="md"
                style={{
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() => handleNavigateToMessage(bookmark)}
              >
                <Group justify="space-between" align="flex-start">
                  <Box style={{ flex: 1 }}>
                    {/* Channel info */}
                    <Group gap={6} mb={8}>
                      {channel?.type === "private" ? (
                        <IconLock size={12} color="#666" />
                      ) : (
                        <IconHash size={12} color="#666" />
                      )}
                      <Text size={10} c="dimmed">
                        #{channel?.name || "Unknown"}
                      </Text>
                      <Text size={10} c="dimmed">
                        •
                      </Text>
                      <Text size={10} c="dimmed">
                        {dayjs(bookmark.created_at).fromNow()}
                      </Text>
                    </Group>

                    {/* Message */}
                    <Group gap={8} align="flex-start">
                      <Avatar src={message?.user?.image} size={32} radius="sm">
                        {message?.user?.username?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box style={{ flex: 1 }}>
                        <Group gap={6} mb={2}>
                          <Text size="xs" fw={600}>
                            {message?.user?.username || "Unknown"}
                          </Text>
                          <Text size={10} c="dimmed">
                            {dayjs(message?.created_at).format("DD MMM, HH:mm")}
                          </Text>
                        </Group>
                        <Box
                          style={{
                            fontSize: 13,
                            lineHeight: 1.5,
                            color: "#333",
                          }}
                        >
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                          >
                            {message?.content?.slice(0, 200) +
                              (message?.content?.length > 200 ? "..." : "")}
                          </ReactMarkdown>
                        </Box>

                        {/* Attachments count */}
                        {message?.attachments?.length > 0 && (
                          <Text size={10} c="dimmed" mt={4}>
                            {message.attachments.length} lampiran
                          </Text>
                        )}
                      </Box>
                    </Group>

                    {/* Note */}
                    {bookmark.note && (
                      <Paper
                        p={8}
                        mt={8}
                        radius="sm"
                        style={{ backgroundColor: "#fffbe6" }}
                      >
                        <Text size={10} c="dimmed" fw={500}>
                          Catatan:
                        </Text>
                        <Text size="xs">{bookmark.note}</Text>
                      </Paper>
                    )}
                  </Box>

                  {/* Actions */}
                  <Group gap={4}>
                    <Tooltip title="Lihat pesan">
                      <Button
                        type="text"
                        size="small"
                        icon={<IconMessage size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigateToMessage(bookmark);
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Hapus dari simpanan">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<IconBookmarkOff size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveBookmark(message.id);
                        }}
                        loading={toggleBookmark.isPending}
                      />
                    </Tooltip>
                  </Group>
                </Group>
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* Pagination */}
      {total > 20 && (
        <Pagination
          current={page}
          total={total}
          pageSize={20}
          onChange={setPage}
          showSizeChanger={false}
          style={{ textAlign: "center", marginTop: 16 }}
        />
      )}
    </Stack>
  );
};

export default BookmarkList;
