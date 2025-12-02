import {
  ActionIcon,
  Avatar,
  Box,
  Divider,
  Group,
  Popover,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconArchive,
  IconChevronDown,
  IconClock,
  IconFlag,
  IconFlagFilled,
  IconFolder,
  IconInbox,
  IconMail,
  IconStar,
  IconStarFilled,
  IconTrash,
} from "@tabler/icons-react";
import { Button, Dropdown, Tooltip } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import EmailLabelSelector from "./EmailLabelSelector";

dayjs.extend(relativeTime);
dayjs.locale("id");

const EmailDetailHeader = ({
  email,
  onToggleStar,
  isStarLoading = false,
  onToggleUnread,
  isUnreadLoading = false,
  onMoveToFolder,
  isMoveToFolderLoading = false,
  onUpdatePriority,
  isUpdatePriorityLoading = false,
  onRefresh,
}) => {
  if (!email) return null;

  const formatDate = (date) => {
    const now = dayjs();
    const emailDate = dayjs(date);
    if (now.diff(emailDate, "day") === 0) {
      return emailDate.format("HH:mm");
    } else if (now.diff(emailDate, "day") < 7) {
      return emailDate.format("dddd, HH:mm");
    }
    return emailDate.format("D MMM YYYY, HH:mm");
  };

  const formatRecipients = (recipients) => {
    if (!recipients || recipients.length === 0) return "-";
    return recipients
      .map((r) => r.user?.username || r.email)
      .join(", ");
  };

  const folderItems = [
    {
      key: "inbox",
      label: "Kotak Masuk",
      icon: <IconInbox size={14} />,
      onClick: () => onMoveToFolder("inbox"),
    },
    {
      key: "archive",
      label: "Arsip",
      icon: <IconArchive size={14} />,
      onClick: () => onMoveToFolder("archive"),
    },
    { type: "divider" },
    {
      key: "trash",
      label: "Sampah",
      icon: <IconTrash size={14} />,
      danger: true,
      onClick: () => onMoveToFolder("trash"),
    },
  ];

  const priorityItems = [
    {
      key: "high",
      label: "Tinggi",
      icon: <IconFlagFilled size={14} style={{ color: "#fa5252" }} />,
      onClick: () => onUpdatePriority("high"),
    },
    {
      key: "normal",
      label: "Normal",
      icon: <IconFlag size={14} />,
      onClick: () => onUpdatePriority("normal"),
    },
    {
      key: "low",
      label: "Rendah",
      icon: <IconFlag size={14} style={{ color: "#228be6" }} />,
      onClick: () => onUpdatePriority("low"),
    },
  ];

  const getPriorityIcon = () => {
    switch (email.priority) {
      case "high":
        return <IconFlagFilled size={16} style={{ color: "#fa5252" }} />;
      case "low":
        return <IconFlag size={16} style={{ color: "#228be6" }} />;
      default:
        return <IconFlag size={16} />;
    }
  };

  const senderName =
    email.sender?.username || email.sender_name || "Tidak dikenal";

  return (
    <Box mb="md">
      {/* Quick Actions */}
      <Group
        gap="xs"
        mb="md"
        p="xs"
        style={{ backgroundColor: "#f8f9fa", borderRadius: 6 }}
      >
        <Tooltip title={email.is_starred ? "Hapus bintang" : "Beri bintang"}>
          <Button
            type="text"
            size="small"
            loading={isStarLoading}
            onClick={onToggleStar}
            icon={
              email.is_starred ? (
                <IconStarFilled size={16} style={{ color: "#fab005" }} />
              ) : (
                <IconStar size={16} />
              )
            }
          />
        </Tooltip>

        <Tooltip title="Tandai belum dibaca">
          <Button
            type="text"
            size="small"
            loading={isUnreadLoading}
            onClick={onToggleUnread}
            icon={<IconMail size={16} />}
          />
        </Tooltip>

        <Dropdown
          menu={{ items: folderItems }}
          trigger={["click"]}
          placement="bottomLeft"
        >
          <Tooltip title="Pindah folder">
            <Button
              type="text"
              size="small"
              loading={isMoveToFolderLoading}
              icon={<IconFolder size={16} />}
            />
          </Tooltip>
        </Dropdown>

        <Dropdown
          menu={{ items: priorityItems }}
          trigger={["click"]}
          placement="bottomLeft"
        >
          <Tooltip title="Prioritas">
            <Button
              type="text"
              size="small"
              loading={isUpdatePriorityLoading}
              icon={getPriorityIcon()}
            />
          </Tooltip>
        </Dropdown>

        <Box style={{ marginLeft: "auto" }}>
          <EmailLabelSelector emailId={email.id} onRefresh={onRefresh} />
        </Box>
      </Group>

      {/* Sender Info */}
      <Group justify="space-between" align="flex-start">
        <Group gap="sm">
          <Avatar
            src={email.sender?.image}
            radius="xl"
            size="md"
            color="blue"
          >
            {senderName.charAt(0).toUpperCase()}
          </Avatar>
          <Stack gap={2}>
            <Text size="sm" fw={600}>
              {senderName}
            </Text>
            <Popover width={300} position="bottom-start" withArrow>
              <Popover.Target>
                <Group gap={4} style={{ cursor: "pointer" }}>
                  <Text size="xs" c="dimmed">
                    kepada {email.recipients?.to?.length || 0} orang
                    {email.recipients?.cc?.length > 0 &&
                      ` dan ${email.recipients.cc.length} CC`}
                  </Text>
                  <IconChevronDown size={12} style={{ color: "#868e96" }} />
                </Group>
              </Popover.Target>
              <Popover.Dropdown>
                <Stack gap="xs">
                  <Group gap="xs">
                    <Text size="xs" fw={600} w={60}>
                      Dari:
                    </Text>
                    <Text size="xs">{senderName}</Text>
                  </Group>
                  <Group gap="xs">
                    <Text size="xs" fw={600} w={60}>
                      Kepada:
                    </Text>
                    <Text size="xs">
                      {formatRecipients(email.recipients?.to)}
                    </Text>
                  </Group>
                  {email.recipients?.cc?.length > 0 && (
                    <Group gap="xs">
                      <Text size="xs" fw={600} w={60}>
                        CC:
                      </Text>
                      <Text size="xs">
                        {formatRecipients(email.recipients.cc)}
                      </Text>
                    </Group>
                  )}
                  <Group gap="xs">
                    <Text size="xs" fw={600} w={60}>
                      Tanggal:
                    </Text>
                    <Text size="xs">
                      {dayjs(email.created_at).format("D MMMM YYYY, HH:mm")}
                    </Text>
                  </Group>
                </Stack>
              </Popover.Dropdown>
            </Popover>
          </Stack>
        </Group>

        <Group gap="xs">
          <IconClock size={14} style={{ color: "#868e96" }} />
          <Tooltip title={dayjs(email.created_at).format("D MMMM YYYY, HH:mm:ss")}>
            <Text size="xs" c="dimmed">
              {formatDate(email.created_at)}
            </Text>
          </Tooltip>
        </Group>
      </Group>

      <Divider my="md" />
    </Box>
  );
};

export default EmailDetailHeader;
