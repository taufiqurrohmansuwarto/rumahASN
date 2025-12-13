import Head from "next/head";
import { Card, Row, Col, Statistic, Table, Skeleton } from "antd";
import { Stack, Text, Group, Avatar, Paper, Box } from "@mantine/core";
import {
  IconMessage,
  IconHash,
  IconUsers,
  IconFile,
  IconPin,
  IconTrendingUp,
} from "@tabler/icons-react";
import ChatLayout from "@/components/ChatLayout";
import { useChatStats, useChannels, useWorkspaceMembers } from "@/hooks/useRasnChat";
import dayjs from "dayjs";

function StatsPage() {
  const { data: stats, isLoading: statsLoading } = useChatStats();
  const { data: channels, isLoading: channelsLoading } = useChannels();
  const { data: membersData, isLoading: membersLoading } = useWorkspaceMembers({ page: 1, limit: 10 });

  const channelColumns = [
    {
      title: "Channel",
      key: "name",
      render: (_, record) => (
        <Group gap={6}>
          <IconHash size={14} />
          <Text size="sm">{record.name}</Text>
        </Group>
      ),
    },
    {
      title: "Tipe",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Text size="xs" c={type === "private" ? "orange" : "green"}>
          {type}
        </Text>
      ),
    },
    {
      title: "Dibuat",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (
        <Text size="xs" c="dimmed">
          {dayjs(date).format("DD MMM YYYY")}
        </Text>
      ),
    },
  ];

  const memberColumns = [
    {
      title: "Member",
      key: "user",
      render: (_, record) => (
        <Group gap={8}>
          <Avatar src={record.user?.image} size={24}>
            {record.user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Text size="xs">{record.user?.username}</Text>
            {record.user?.info?.nama && (
              <Text size={10} c="dimmed">{record.user.info.nama}</Text>
            )}
          </Box>
        </Group>
      ),
    },
    {
      title: "Role",
      dataIndex: ["role", "name"],
      key: "role",
    },
    {
      title: "Bergabung",
      dataIndex: "joined_at",
      key: "joined_at",
      render: (date) => (
        <Text size="xs" c="dimmed">
          {dayjs(date).format("DD MMM YYYY")}
        </Text>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Statistik Chat | Rumah ASN</title>
      </Head>

      <Stack gap="md" p="md">
        <Text size="lg" fw={700}>Statistik Chat</Text>

        {/* Overview Stats */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              {statsLoading ? (
                <Skeleton active paragraph={false} />
              ) : (
                <Statistic
                  title="Total Pesan"
                  value={stats?.messages || 0}
                  prefix={<IconMessage size={20} style={{ marginRight: 8 }} />}
                />
              )}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              {statsLoading ? (
                <Skeleton active paragraph={false} />
              ) : (
                <Statistic
                  title="Total Channel"
                  value={stats?.channels || 0}
                  prefix={<IconHash size={20} style={{ marginRight: 8 }} />}
                />
              )}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              {statsLoading ? (
                <Skeleton active paragraph={false} />
              ) : (
                <Statistic
                  title="Total Member"
                  value={stats?.members || 0}
                  prefix={<IconUsers size={20} style={{ marginRight: 8 }} />}
                />
              )}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              {statsLoading ? (
                <Skeleton active paragraph={false} />
              ) : (
                <Statistic
                  title="Total File"
                  value={stats?.files || 0}
                  prefix={<IconFile size={20} style={{ marginRight: 8 }} />}
                />
              )}
            </Card>
          </Col>
        </Row>

        {/* Channels List */}
        <Paper withBorder p="md" radius="md">
          <Group gap={6} mb="md">
            <IconHash size={16} />
            <Text size="sm" fw={600}>Daftar Channel</Text>
          </Group>
          <Table
            dataSource={channels || []}
            columns={channelColumns}
            rowKey="id"
            size="small"
            loading={channelsLoading}
            pagination={{ pageSize: 5 }}
          />
        </Paper>

        {/* Members List */}
        <Paper withBorder p="md" radius="md">
          <Group gap={6} mb="md">
            <IconUsers size={16} />
            <Text size="sm" fw={600}>Member Terbaru</Text>
          </Group>
          <Table
            dataSource={membersData?.results || []}
            columns={memberColumns}
            rowKey="id"
            size="small"
            loading={membersLoading}
            pagination={false}
          />
        </Paper>
      </Stack>
    </>
  );
}

StatsPage.getLayout = function getLayout(page) {
  return <ChatLayout>{page}</ChatLayout>;
};

StatsPage.Auth = {
  action: "manage",
  subject: "tickets",
};

export default StatsPage;

