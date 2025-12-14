import {
  useChannel,
  useChannelMembers,
  usePinnedMessages,
  useMyWorkspaceMembership,
  useDeleteChannel,
  useArchiveChannel,
  useUnarchiveChannel,
  useTogglePinMessage,
  useInviteMember,
  useRemoveMember,
  useSearchUsers,
  useChatStats,
} from "@/hooks/useRasnChat";
import { Skeleton, Tooltip, Drawer, Avatar, Modal, message, Dropdown, Select, Popconfirm, Empty } from "antd";
import {
  IconHash,
  IconLock,
  IconUsers,
  IconPin,
  IconInfoCircle,
  IconSettings,
  IconTrash,
  IconArchive,
  IconBroadcast,
  IconDotsVertical,
  IconUserPlus,
  IconChartBar,
  IconX,
  IconPinned,
} from "@tabler/icons-react";
import { useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Group, Text, Box, ActionIcon, Paper, Stack, Badge } from "@mantine/core";

// Pinned Message Bar - Shows latest pinned message
const PinnedMessageBar = ({ pinned, onViewAll, onUnpin, channelId }) => {
  if (!pinned?.length) return null;
  
  const latest = pinned[0];
  const togglePin = useTogglePinMessage();
  
  const handleUnpin = (e) => {
    e.stopPropagation();
    togglePin.mutate({ channelId, messageId: latest.message_id });
  };
  
  return (
    <Box
      px="md"
      py={4}
      style={{
        backgroundColor: "#fef9e7",
        borderBottom: "1px solid #f5e6b3",
        cursor: "pointer",
      }}
      onClick={onViewAll}
    >
      <Group gap={6} wrap="nowrap" justify="space-between">
        <Group gap={6} style={{ flex: 1, minWidth: 0 }}>
          <IconPinned size={12} color="#d4a72c" />
          <Text size="xs" fw={600} c="orange" style={{ flexShrink: 0 }}>
            Pinned
          </Text>
          <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
            {latest?.message?.user?.username}:
          </Text>
          <Text size="xs" truncate style={{ flex: 1 }}>
            {latest?.message?.content}
          </Text>
          {pinned.length > 1 && (
            <Text size={10} c="dimmed" style={{ flexShrink: 0 }}>
              +{pinned.length - 1} lainnya
            </Text>
          )}
        </Group>
        <Tooltip title="Unpin">
          <ActionIcon 
            size="xs" 
            variant="subtle" 
            color="orange"
            onClick={handleUnpin}
            loading={togglePin.isLoading}
          >
            <IconX size={12} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Box>
  );
};

// Invite Member Modal
const InviteMemberModal = ({ open, onClose, channelId, existingMembers }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults, isLoading } = useSearchUsers(searchQuery);
  const inviteMember = useInviteMember();
  
  const existingUserIds = existingMembers?.map(m => m.user_id) || [];
  const filteredResults = searchResults?.filter(u => !existingUserIds.includes(u.custom_id)) || [];
  
  const handleInvite = async () => {
    if (!selectedUser) return;
    try {
      await inviteMember.mutateAsync({ channelId, userId: selectedUser });
      // Success message handled by hook
      setSelectedUser(null);
      onClose();
    } catch (e) {
      // Error message handled by hook
    }
  };
  
  return (
    <Modal
      title={
        <Group gap={6}>
          <IconUserPlus size={16} />
          <span>Undang Member</span>
        </Group>
      }
      open={open}
      onCancel={onClose}
      onOk={handleInvite}
      okText="Undang"
      cancelText="Batal"
      confirmLoading={inviteMember.isLoading}
      okButtonProps={{ disabled: !selectedUser }}
    >
      <Select
        showSearch
        placeholder="Cari user..."
        style={{ width: "100%" }}
        value={selectedUser}
        onChange={setSelectedUser}
        onSearch={setSearchQuery}
        loading={isLoading}
        filterOption={false}
        notFoundContent={isLoading ? "Mencari..." : "Tidak ditemukan"}
        options={filteredResults?.map(u => ({
          value: u.custom_id,
          label: (
            <Group gap={8}>
              <Avatar src={u.image} size={24}>{u.username?.[0]}</Avatar>
              <div>
                <Text size="xs">{u.username}</Text>
                {u.info?.nama && <Text size={10} c="dimmed">{u.info.nama}</Text>}
              </div>
            </Group>
          ),
        }))}
      />
    </Modal>
  );
};

// Channel Details Drawer with Stats
const ChannelDetailsDrawer = ({ channel, members, pinned, open, onClose, channelId, onUnpinMessage }) => {
  const { data: stats } = useChatStats();
  const removeMember = useRemoveMember();
  const togglePin = useTogglePinMessage();
  
  const handleRemoveMember = async (userId) => {
    try {
      await removeMember.mutateAsync({ channelId, userId });
      message.success("Member berhasil dihapus");
    } catch (e) {
      message.error("Gagal menghapus member");
    }
  };
  
  const handleUnpin = async (messageId) => {
    try {
      await togglePin.mutateAsync({ channelId, messageId });
    } catch (e) {
      message.error("Gagal unpin pesan");
    }
  };
  
  return (
    <Drawer
      title={
        <Group gap={6}>
          {channel?.type === "private" ? <IconLock size={16} /> : <IconHash size={16} />}
          <span style={{ fontWeight: 600 }}>{channel?.name}</span>
        </Group>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={340}
      styles={{ body: { padding: 0 } }}
    >
      {/* Description */}
      {channel?.description && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0" }}>
          <Text size="xs" c="dimmed">{channel.description}</Text>
        </div>
      )}

      {/* Stats */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0" }}>
        <Group gap={6} mb={8}>
          <IconChartBar size={14} />
          <Text size="xs" fw={600}>STATISTIK</Text>
        </Group>
        <Group gap={16}>
          <div>
            <Text size="xs" c="dimmed">Member</Text>
            <Text size="sm" fw={600}>{members?.length || 0}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">Pinned</Text>
            <Text size="sm" fw={600}>{pinned?.length || 0}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">Total Pesan</Text>
            <Text size="sm" fw={600}>{stats?.messages || 0}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">Total Channel</Text>
            <Text size="sm" fw={600}>{stats?.channels || 0}</Text>
          </div>
        </Group>
      </div>

      {/* Members */}
      <div style={{ padding: "8px 0", maxHeight: 220, overflowY: "auto" }}>
        <div style={{ padding: "4px 16px 8px" }}>
          <Group justify="space-between">
            <Text size="xs" c="dimmed" fw={600}>MEMBER ({members?.length || 0})</Text>
          </Group>
        </div>
        {members?.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "6px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Avatar src={item.user?.image} size={28}>
              {item.user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text size="xs" truncate>{item.user?.username}</Text>
              {item.role?.name && (
                <Badge size="xs" variant="light" color={
                  item.role?.id?.includes("owner") ? "red" :
                  item.role?.id?.includes("admin") ? "orange" : "gray"
                }>
                  {item.role?.name}
                </Badge>
              )}
            </div>
            {channel?.type === "private" && (
              <Popconfirm
                title="Hapus member ini?"
                onConfirm={() => handleRemoveMember(item.user_id)}
                okText="Ya"
                cancelText="Tidak"
              >
                <ActionIcon size="xs" variant="subtle" color="red">
                  <IconX size={12} />
                </ActionIcon>
              </Popconfirm>
            )}
          </div>
        ))}
      </div>

      {/* Pinned Messages */}
      <div style={{ padding: "8px 0", borderTop: "1px solid #f0f0f0", maxHeight: 220, overflowY: "auto" }}>
        <div style={{ padding: "4px 16px 8px" }}>
          <Group justify="space-between">
            <Text size="xs" c="dimmed" fw={600}>PINNED MESSAGES ({pinned?.length || 0})</Text>
          </Group>
        </div>
        {pinned?.length === 0 ? (
          <Empty description="Tidak ada pesan di-pin" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          pinned?.map((item) => (
            <Paper key={item.id} mx="sm" mb={6} p={8} withBorder radius="sm">
              <Group justify="space-between" mb={4}>
                <Group gap={6}>
                  <Avatar src={item.message?.user?.image} size={18}>
                    {item.message?.user?.username?.[0]?.toUpperCase()}
                  </Avatar>
                  <Text size="xs" fw={600}>{item.message?.user?.username}</Text>
                </Group>
                <Tooltip title="Unpin">
                  <ActionIcon 
                    size="xs" 
                    variant="subtle" 
                    color="orange"
                    onClick={() => handleUnpin(item.message_id)}
                    loading={togglePin.isLoading}
                  >
                    <IconX size={12} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              <Text size="xs" lineClamp={2}>{item.message?.content}</Text>
            </Paper>
          ))
        )}
      </div>
    </Drawer>
  );
};

const ChannelHeader = ({ channelId, onStartCall, onSettings }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: channel, isLoading } = useChannel(channelId);
  const { data: members } = useChannelMembers(channelId);
  const { data: pinned } = usePinnedMessages(channelId);
  const { data: membership } = useMyWorkspaceMembership();

  const deleteChannel = useDeleteChannel();
  const archiveChannel = useArchiveChannel();
  const unarchiveChannel = useUnarchiveChannel();

  // Check if current user is channel owner
  const currentUserId = session?.user?.id;
  const myChannelMembership = members?.find((m) => m.user_id === currentUserId);
  const isChannelOwner = myChannelMembership?.role_id === "ch-role-owner";

  // Check permissions
  const permissions = membership?.role?.permissions || {};
  const canManageChannels = permissions.can_delete_channel || permissions.all || isChannelOwner;
  const canBroadcast = permissions.can_broadcast || permissions.all;
  const canInvite = channel?.type === "private" || permissions.all || isChannelOwner;

  const handleDeleteChannel = () => {
    Modal.confirm({
      title: "Hapus Channel?",
      content: `Channel "${channel?.name}" akan dihapus permanen beserta semua pesan.`,
      okText: "Ya, Hapus",
      cancelText: "Batal",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteChannel.mutateAsync(channelId);
          message.success("Channel berhasil dihapus");
          router.push("/rasn-chat");
        } catch (e) {
          message.error("Gagal menghapus channel");
        }
      },
    });
  };

  const handleArchiveChannel = async () => {
    try {
      await archiveChannel.mutateAsync(channelId);
      // Success message handled by hook
    } catch (e) {
      // Error handled by hook
    }
  };

  const handleUnarchiveChannel = async () => {
    try {
      await unarchiveChannel.mutateAsync(channelId);
      // Success message handled by hook
    } catch (e) {
      // Error handled by hook
    }
  };

  // Check if channel is archived
  const isArchived = channel?.is_archived;

  // Admin menu items
  const adminMenuItems = [
    ...(canInvite ? [
      { key: "invite", icon: <IconUserPlus size={14} />, label: "Undang Member" },
    ] : []),
    ...(canManageChannels ? [
      { key: "settings", icon: <IconSettings size={14} />, label: "Pengaturan Channel" },
      isArchived
        ? { key: "unarchive", icon: <IconArchive size={14} />, label: "Batal Arsip" }
        : { key: "archive", icon: <IconArchive size={14} />, label: "Arsipkan Channel" },
      { type: "divider" },
      { key: "delete", icon: <IconTrash size={14} />, label: "Hapus Channel", danger: true },
    ] : []),
    ...(canBroadcast ? [
      { type: "divider" },
      { key: "broadcast", icon: <IconBroadcast size={14} />, label: "Broadcast ke Semua" },
    ] : []),
  ];

  const handleAdminMenuClick = ({ key }) => {
    if (key === "settings") onSettings?.();
    if (key === "delete") handleDeleteChannel();
    if (key === "archive") handleArchiveChannel();
    if (key === "unarchive") handleUnarchiveChannel();
    if (key === "invite") setInviteOpen(true);
    if (key === "broadcast") {
      message.info("Fitur broadcast dalam pengembangan");
    }
  };

  if (isLoading) return <Skeleton.Input active style={{ width: 200 }} />;
  if (!channel) return null;

  return (
    <>
      {/* Main Header */}
      <Box
        px="md"
        py={8}
        style={{ borderBottom: "1px solid #e8e8e8", backgroundColor: "#fff" }}
      >
        <Group justify="space-between" wrap="nowrap">
          {/* Left - Channel info */}
          <Group gap={6} style={{ minWidth: 0 }}>
            {channel.type === "private" ? (
              <IconLock size={16} color="#1d1c1d" />
            ) : (
              <IconHash size={16} color="#1d1c1d" />
            )}
            <Text size="sm" fw={700}>{channel.name}</Text>
            <Text c="dimmed" size="xs">|</Text>
            <Group gap={4}>
              <IconUsers size={12} color="#616061" />
              <Text size="xs" c="dimmed">{members?.length || 0}</Text>
            </Group>
          </Group>

          {/* Right - Actions */}
          <Group gap={2}>
            {canInvite && (
              <Tooltip title="Undang Member">
                <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => setInviteOpen(true)}>
                  <IconUserPlus size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            <Tooltip title="Info & Stats">
              <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => setDetailsOpen(true)}>
                <IconInfoCircle size={16} />
              </ActionIcon>
            </Tooltip>

            {/* Admin Menu */}
            {adminMenuItems.length > 0 && (
              <Dropdown
                menu={{ items: adminMenuItems, onClick: handleAdminMenuClick }}
                trigger={["click"]}
              >
                <ActionIcon variant="subtle" color="gray" size="sm">
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Dropdown>
            )}
          </Group>
        </Group>
      </Box>

      {/* Pinned Message Bar */}
      <PinnedMessageBar 
        pinned={pinned} 
        onViewAll={() => setDetailsOpen(true)} 
        channelId={channelId}
      />

      {/* Channel Details Drawer */}
      <ChannelDetailsDrawer
        channel={channel}
        members={members}
        pinned={pinned}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        channelId={channelId}
      />
      
      {/* Invite Member Modal */}
      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        channelId={channelId}
        existingMembers={members}
      />
    </>
  );
};

export default ChannelHeader;
