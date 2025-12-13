import {
  useWorkspaceRoles,
  useWorkspaceMembers,
  useUpdateMemberWorkspaceRole,
  useChannelRoles,
} from "@/hooks/useRasnChat";
import { Table, Select, Skeleton, Tabs, Tag } from "antd";
import { Stack, Text, Group, Avatar, Badge, Paper, Box, SimpleGrid } from "@mantine/core";
import {
  IconShield,
  IconUser,
  IconCrown,
  IconCheck,
  IconX,
  IconMessage,
  IconPin,
  IconTrash,
  IconUserPlus,
  IconSettings,
  IconVideo,
  IconUpload,
  IconAt,
  IconEdit,
} from "@tabler/icons-react";

const getRoleIcon = (roleId) => {
  if (roleId?.includes("superadmin") || roleId?.includes("owner")) return <IconCrown size={14} />;
  if (roleId?.includes("admin")) return <IconShield size={14} />;
  return <IconUser size={14} />;
};

const getRoleColor = (roleId) => {
  if (roleId?.includes("superadmin") || roleId?.includes("owner")) return "red";
  if (roleId?.includes("admin")) return "orange";
  if (roleId?.includes("moderator")) return "blue";
  return "gray";
};

// Deskripsi permissions yang mudah dibaca
const PERMISSION_INFO = {
  // Workspace permissions
  manage_workspace: { label: "Kelola Workspace", icon: IconSettings, desc: "Ubah pengaturan workspace" },
  manage_channels: { label: "Kelola Channel", icon: IconSettings, desc: "Buat, edit, hapus channel" },
  manage_members: { label: "Kelola Member", icon: IconUserPlus, desc: "Invite/kick member workspace" },
  manage_roles: { label: "Kelola Roles", icon: IconShield, desc: "Ubah role member" },
  view_all_channels: { label: "Lihat Semua Channel", icon: IconMessage, desc: "Akses channel private" },
  
  // Channel permissions
  send_messages: { label: "Kirim Pesan", icon: IconMessage, desc: "Kirim pesan di channel" },
  edit_messages: { label: "Edit Pesan", icon: IconEdit, desc: "Edit pesan sendiri" },
  delete_messages: { label: "Hapus Pesan", icon: IconTrash, desc: "Hapus pesan orang lain" },
  pin_messages: { label: "Pin Pesan", icon: IconPin, desc: "Pin/unpin pesan" },
  manage_channel: { label: "Kelola Channel", icon: IconSettings, desc: "Edit nama, deskripsi channel" },
  invite_members: { label: "Undang Member", icon: IconUserPlus, desc: "Undang orang ke channel" },
  remove_members: { label: "Hapus Member", icon: IconTrash, desc: "Kick member dari channel" },
  mention_all: { label: "Mention All", icon: IconAt, desc: "Gunakan @channel @here" },
  upload_files: { label: "Upload File", icon: IconUpload, desc: "Upload file dan media" },
  start_calls: { label: "Mulai Call", icon: IconVideo, desc: "Mulai video/voice call" },
};

const PermissionItem = ({ permKey, value }) => {
  const info = PERMISSION_INFO[permKey] || { label: permKey, icon: IconCheck, desc: "" };
  const Icon = info.icon;
  
  return (
    <Group gap={6} style={{ opacity: value ? 1 : 0.4 }}>
      {value ? (
        <IconCheck size={12} color="green" />
      ) : (
        <IconX size={12} color="red" />
      )}
      <Icon size={12} />
      <Text size={10}>{info.label}</Text>
    </Group>
  );
};

const WorkspaceRolesTab = () => {
  const { data: roles, isLoading: rolesLoading } = useWorkspaceRoles();
  const { data: members, isLoading: membersLoading } = useWorkspaceMembers({ page: 1, limit: 50 });
  const updateRole = useUpdateMemberWorkspaceRole();

  if (rolesLoading || membersLoading) return <Skeleton active />;

  // Tampilkan info roles dulu
  const RolesInfo = () => (
    <Stack gap="xs" mb="md">
      <Text size="xs" fw={600} c="dimmed">WORKSPACE ROLES</Text>
      {roles?.map((role) => (
        <Paper key={role.id} withBorder p="xs" radius="sm">
          <Group justify="space-between" mb={4}>
            <Group gap={6}>
              {getRoleIcon(role.id)}
              <Text size="xs" fw={600}>{role.name}</Text>
              <Badge size="xs" color={getRoleColor(role.id)} variant="light">{role.id}</Badge>
            </Group>
          </Group>
          <Text size={10} c="dimmed" mb={6}>{role.description}</Text>
          {role.permissions && (
            <SimpleGrid cols={2} spacing={4}>
              {Object.entries(role.permissions).map(([key, val]) => (
                <PermissionItem key={key} permKey={key} value={val} />
              ))}
            </SimpleGrid>
          )}
        </Paper>
      ))}
    </Stack>
  );

  const columns = [
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <Group gap="xs">
          <Avatar src={record.user?.image} size={24} radius="xl">
            {record.user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <div>
            <Text size="xs">{record.user?.username}</Text>
            {record.user?.info?.nama && (
              <Text size={10} c="dimmed">{record.user?.info?.nama}</Text>
            )}
          </div>
        </Group>
      ),
    },
    {
      title: "Role",
      key: "role",
      width: 180,
      render: (_, record) => (
        <Select
          value={record.role_id}
          onChange={(value) => updateRole.mutate({ userId: record.user_id, roleId: value })}
          options={roles?.map((r) => ({
            value: r.id,
            label: r.name,
          }))}
          style={{ width: "100%" }}
          size="small"
          loading={updateRole.isLoading}
        />
      ),
    },
    {
      title: "Bergabung",
      dataIndex: "joined_at",
      key: "joined_at",
      width: 100,
      render: (date) => (
        <Text size={10}>{new Date(date).toLocaleDateString("id-ID")}</Text>
      ),
    },
  ];

  return (
    <div>
      <RolesInfo />
      
      <Text size="xs" fw={600} c="dimmed" mb="xs">MEMBER LIST</Text>
      <Table
        dataSource={members?.results || []}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={{
          total: members?.total,
          pageSize: 50,
          showTotal: (total) => <Text size={10}>{total} member</Text>,
          size: "small",
        }}
      />
    </div>
  );
};

const ChannelRolesTab = () => {
  const { data: roles, isLoading } = useChannelRoles();

  if (isLoading) return <Skeleton active />;

  return (
    <div>
      <Text size="xs" c="dimmed" mb="md">
        Role channel menentukan apa yang bisa dilakukan member di dalam channel.
        Owner channel bisa mengatur role member di channel.
      </Text>
      
      <Stack gap="sm">
        {roles?.map((role) => (
          <Paper key={role.id} withBorder p="sm" radius="sm">
            <Group justify="space-between" mb={6}>
              <Group gap={6}>
                {getRoleIcon(role.id)}
                <Text size="sm" fw={600}>{role.name}</Text>
              </Group>
              <Badge color={getRoleColor(role.id)} variant="light" size="sm">
                {role.id}
              </Badge>
            </Group>
            
            <Text size="xs" c="dimmed" mb="sm">{role.description}</Text>
            
            {role.permissions && (
              <Box>
                <Text size={10} c="dimmed" mb={4}>Permissions:</Text>
                <SimpleGrid cols={2} spacing={4}>
                  {Object.entries(role.permissions).map(([key, val]) => (
                    <PermissionItem key={key} permKey={key} value={val} />
                  ))}
                </SimpleGrid>
              </Box>
            )}
          </Paper>
        ))}
      </Stack>
      
      {/* Legend */}
      <Paper withBorder p="xs" mt="md" radius="sm" style={{ backgroundColor: "#fafafa" }}>
        <Text size={10} fw={600} mb={6}>KETERANGAN:</Text>
        <Stack gap={4}>
          <Group gap={4}>
            <IconCrown size={12} color="red" />
            <Text size={10}><strong>Owner</strong> - Pemilik channel, semua akses</Text>
          </Group>
          <Group gap={4}>
            <IconShield size={12} color="orange" />
            <Text size={10}><strong>Admin</strong> - Kelola member & pesan</Text>
          </Group>
          <Group gap={4}>
            <IconShield size={12} color="blue" />
            <Text size={10}><strong>Moderator</strong> - Pin pesan, hapus pesan</Text>
          </Group>
          <Group gap={4}>
            <IconUser size={12} color="gray" />
            <Text size={10}><strong>Member</strong> - Kirim pesan & file</Text>
          </Group>
        </Stack>
      </Paper>
    </div>
  );
};

const RolesManager = () => {
  const items = [
    { 
      key: "workspace", 
      label: <Text size="xs">Workspace Roles</Text>, 
      children: <WorkspaceRolesTab /> 
    },
    { 
      key: "channel", 
      label: <Text size="xs">Channel Roles</Text>, 
      children: <ChannelRolesTab /> 
    },
  ];

  return <Tabs items={items} size="small" />;
};

export default RolesManager;
