import {
  useChannelMembers,
  useChannelRoles,
  useUpdateMemberRole,
  useRemoveMember,
  useInviteMember,
  useSearchUsers,
} from "@/hooks/useRasnChat";
import { Table, Select, Button, Modal, Input, Popconfirm, message } from "antd";
import { Stack, Text, Group, Avatar, Badge, Paper, Box } from "@mantine/core";
import { IconUserPlus, IconTrash, IconCrown, IconShield, IconUser } from "@tabler/icons-react";
import { useState } from "react";

const getRoleIcon = (roleId) => {
  if (roleId?.includes("owner")) return <IconCrown size={12} color="#faad14" />;
  if (roleId?.includes("admin")) return <IconShield size={12} color="#1890ff" />;
  return <IconUser size={12} color="#999" />;
};

const InviteMemberModal = ({ channelId, open, onClose }) => {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const { data: users, isLoading } = useSearchUsers(search);
  const { data: roles } = useChannelRoles();
  const inviteMember = useInviteMember();

  const handleInvite = async () => {
    if (!selectedUser) {
      message.error("Pilih user terlebih dahulu");
      return;
    }
    try {
      await inviteMember.mutateAsync({
        channelId,
        userId: selectedUser,
        roleId: "ch-role-member",
      });
      onClose();
      setSelectedUser(null);
      setSearch("");
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Modal
      title="Undang Member"
      open={open}
      onCancel={onClose}
      onOk={handleInvite}
      confirmLoading={inviteMember.isLoading}
      okText="Undang"
      cancelText="Batal"
    >
      <Stack gap="md">
        <div>
          <Text size="sm" mb={4}>Cari User</Text>
          <Input.Search
            placeholder="Cari nama atau NIP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            loading={isLoading}
          />
        </div>

        {users?.length > 0 && (
          <Stack gap="xs">
            {users.map((user) => (
              <Paper
                key={user.custom_id}
                withBorder
                p="xs"
                onClick={() => setSelectedUser(user.custom_id)}
                style={{
                  cursor: "pointer",
                  backgroundColor: selectedUser === user.custom_id ? "#e6f4ff" : "transparent",
                }}
              >
                <Group gap="xs">
                  <Avatar src={user.image} size="sm" radius="xl">
                    {user.username?.[0]?.toUpperCase()}
                  </Avatar>
                  <div>
                    <Text size="sm">{user.username}</Text>
                    {user.info?.nip && <Text size="xs" c="dimmed">NIP: {user.info.nip}</Text>}
                  </div>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Modal>
  );
};

const ChannelMembers = ({ channelId }) => {
  const [inviteOpen, setInviteOpen] = useState(false);
  const { data: members, isLoading } = useChannelMembers(channelId);
  const { data: roles } = useChannelRoles();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();

  const columns = [
    {
      title: "Member",
      key: "user",
      render: (_, record) => (
        <Group gap="xs">
          <Avatar src={record.user?.image} size="sm" radius="xl">
            {record.user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <div>
            <Group gap={4}>
              <Text size="sm">{record.user?.username}</Text>
              {getRoleIcon(record.role_id)}
            </Group>
            {record.user?.info?.nip && (
              <Text size="xs" c="dimmed">NIP: {record.user?.info?.nip}</Text>
            )}
          </div>
        </Group>
      ),
    },
    {
      title: "Role",
      key: "role",
      width: 160,
      render: (_, record) => (
        <Select
          value={record.role_id}
          onChange={(value) =>
            updateRole.mutate({ channelId, userId: record.user_id, roleId: value })
          }
          options={roles?.map((r) => ({ value: r.id, label: r.name }))}
          style={{ width: "100%" }}
          size="small"
          disabled={record.role_id === "ch-role-owner"}
        />
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 100,
      render: (_, record) => (
        <Group gap={4}>
          {record.is_muted && <Badge size="xs" color="gray">Muted</Badge>}
          {record.is_online && <Badge size="xs" color="green">Online</Badge>}
        </Group>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 60,
      render: (_, record) =>
        record.role_id !== "ch-role-owner" && (
          <Popconfirm
            title="Hapus member ini?"
            onConfirm={() => removeMember.mutate({ channelId, userId: record.user_id })}
            okText="Ya"
            cancelText="Batal"
          >
            <Button type="text" danger size="small" icon={<IconTrash size={14} />} />
          </Popconfirm>
        ),
    },
  ];

  return (
    <div>
      <Group justify="space-between" mb="md">
        <Text size="sm">{members?.length || 0} member di channel ini</Text>
        <Button
          type="primary"
          size="small"
          icon={<IconUserPlus size={14} />}
          onClick={() => setInviteOpen(true)}
        >
          Undang
        </Button>
      </Group>

      <Table
        dataSource={members || []}
        columns={columns}
        rowKey="id"
        size="small"
        loading={isLoading}
        pagination={false}
      />

      <InviteMemberModal
        channelId={channelId}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  );
};

export default ChannelMembers;

