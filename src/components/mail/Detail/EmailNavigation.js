// Komponen navigasi email seperti Gmail
// Menggunakan query parameter untuk navigasi yang lebih reliable
import { Group, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Button, Tooltip } from "antd";
import { useRouter } from "next/router";

const EmailNavigation = ({ currentEmailId, basePath = "/mails/inbox" }) => {
  const router = useRouter();
  const { idx, total, ids } = router.query;

  // Parse data dari query
  const currentIndex = idx ? parseInt(idx) : -1;
  const totalEmails = total ? parseInt(total) : 0;
  const emailIds = ids ? ids.split(",") : [];

  // Jika tidak ada data navigasi, tidak tampilkan
  if (currentIndex === -1 || totalEmails === 0 || emailIds.length === 0) {
    return null;
  }

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < emailIds.length - 1;

  const navigateTo = (newIndex) => {
    const newEmailId = emailIds[newIndex];
    if (newEmailId) {
      router.push({
        pathname: `${basePath}/${newEmailId}`,
        query: { idx: newIndex, total: totalEmails, ids: ids },
      });
    }
  };

  return (
    <Group gap={8} align="center">
      <Text size="xs" c="dimmed">
        {currentIndex + 1} dari {totalEmails}
      </Text>
      <Group gap={2}>
        <Tooltip title="Email sebelumnya">
          <Button
            type="text"
            size="small"
            icon={<IconChevronLeft size={16} />}
            disabled={!hasPrev}
            onClick={() => navigateTo(currentIndex - 1)}
            style={{ padding: "2px 6px" }}
          />
        </Tooltip>
        <Tooltip title="Email berikutnya">
          <Button
            type="text"
            size="small"
            icon={<IconChevronRight size={16} />}
            disabled={!hasNext}
            onClick={() => navigateTo(currentIndex + 1)}
            style={{ padding: "2px 6px" }}
          />
        </Tooltip>
      </Group>
    </Group>
  );
};

export default EmailNavigation;
