import { Card, Avatar, Tag, Typography, Tooltip, Space, Flex } from "antd";
import {
  IconUsers,
  IconEye,
  IconLayoutKanban,
  IconChevronRight,
} from "@tabler/icons-react";
import { useRouter } from "next/router";

const { Text, Title } = Typography;

function ProjectCard({ project }) {
  const router = useRouter();

  const memberCount = project.members?.length || 0;
  const columnCount = project.columns?.length || 0;
  const roleLabel = {
    owner: "OWNER",
    admin: "ADMIN",
    member: "MEMBER",
    watcher: "WATCHER",
  };
  const roleColor = {
    owner: "blue",
    admin: "green",
    member: "default",
    watcher: "orange",
  };

  const handleClick = () => {
    router.push(`/kanban/${project.id}`);
  };

  return (
    <Card
      hoverable
      onClick={handleClick}
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #f0f0f0",
        height: "100%",
      }}
      styles={{
        body: { padding: 0 },
      }}
    >
      {/* Orange Accent Top Border */}
      <div
        style={{
          height: 4,
          background: `linear-gradient(90deg, #fa541c 0%, #ff7a45 100%)`,
        }}
      />

      <div style={{ padding: 16 }}>
        {/* Header with Icon and Title */}
        <Flex gap={12} align="flex-start" style={{ marginBottom: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              backgroundColor: "#fff7e6",
              border: "1px solid #ffd591",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              flexShrink: 0,
            }}
          >
            {project.icon || "📋"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Title
              level={5}
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 600,
                lineHeight: 1.4,
              }}
              ellipsis={{ rows: 1 }}
            >
              {project.name}
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: 12 }}
              ellipsis
            >
              {project.description || "Tidak ada deskripsi"}
            </Text>
          </div>
        </Flex>

        {/* Stats Row */}
        <Flex gap={16} style={{ marginBottom: 12 }}>
          <Tooltip title="Jumlah Kolom">
            <Space size={4}>
              <IconLayoutKanban size={14} color="#8c8c8c" />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {columnCount}
              </Text>
            </Space>
          </Tooltip>
          <Tooltip title="Jumlah Anggota">
            <Space size={4}>
              <IconUsers size={14} color="#8c8c8c" />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {memberCount}
              </Text>
            </Space>
          </Tooltip>
          {project.is_watcher && (
            <Tooltip title="Anda sebagai pemantau">
              <Space size={4}>
                <IconEye size={14} color="#fa8c16" />
                <Text style={{ fontSize: 12, color: "#fa8c16" }}>Pemantau</Text>
              </Space>
            </Tooltip>
          )}
        </Flex>

        {/* Footer with Avatars and Role */}
        <Flex justify="space-between" align="center">
          {/* Member Avatars */}
          <Avatar.Group
            size={28}
            max={{
              count: 3,
              style: {
                backgroundColor: "#fa541c",
                fontSize: 11,
              },
            }}
          >
            {project.members?.slice(0, 4).map((member) => (
              <Tooltip key={member.id} title={member.user?.username}>
                <Avatar src={member.user?.image} size={28}>
                  {member.user?.username?.charAt(0)?.toUpperCase()}
                </Avatar>
              </Tooltip>
            ))}
          </Avatar.Group>

          {/* Role Badge */}
          <Tag
            color={roleColor[project.my_role] || "default"}
            style={{
              margin: 0,
              fontSize: 10,
              fontWeight: 600,
              borderRadius: 4,
            }}
          >
            {roleLabel[project.my_role] || "MEMBER"}
          </Tag>
        </Flex>
      </div>
    </Card>
  );
}

export default ProjectCard;
