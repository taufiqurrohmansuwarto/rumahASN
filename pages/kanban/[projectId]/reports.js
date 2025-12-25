import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { Card, DatePicker, Table, Breadcrumb, Tabs } from "antd";
import {
  Stack,
  Group,
  Text,
  SimpleGrid,
  Paper,
  Progress,
  Avatar,
  Badge,
} from "@mantine/core";
import {
  IconChecklist,
  IconClock,
  IconAlertTriangle,
  IconTrendingUp,
  IconChartBar,
  IconFileText,
  IconFiles,
} from "@tabler/icons-react";
import Head from "next/head";
import Link from "next/link";
import dayjs from "dayjs";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import LayoutKanban from "@/components/Kanban/LayoutKanban";
import AIProjectSummary from "@/components/Kanban/AIProjectSummary";
import LaporanKegiatan from "@/components/Kanban/LaporanKegiatan";
import ProjectFiles from "@/components/Kanban/ProjectFiles";
import {
  getProject,
  getProjectOverview,
  getMemberReport,
  getTimeReport,
} from "../../../services/kanban.services";

const { RangePicker } = DatePicker;

function StatCard({ icon: Icon, label, value, color, subValue }) {
  return (
    <Paper p="md" radius="md" withBorder>
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase">
            {label}
          </Text>
          <Text size="xl" fw={700}>
            {value}
          </Text>
          {subValue && (
            <Text size="xs" c="dimmed">
              {subValue}
            </Text>
          )}
        </Stack>
        <Icon size={32} color={color} style={{ opacity: 0.6 }} />
      </Group>
    </Paper>
  );
}

function ReportsPage() {
  const router = useRouter();
  const { projectId } = router.query;
  const [activeTab, setActiveTab] = useState("statistik");
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);

  const startDate = dateRange?.[0]?.format("YYYY-MM-DD");
  const endDate = dateRange?.[1]?.format("YYYY-MM-DD");

  // Fetch project
  const { data: project, isLoading: isLoadingProject } = useQuery(
    ["kanban-project", projectId],
    () => getProject(projectId),
    { enabled: !!projectId }
  );

  // Fetch overview
  const { data: overview, isLoading: isLoadingOverview } = useQuery(
    ["kanban-overview", projectId],
    () => getProjectOverview(projectId),
    { enabled: !!projectId }
  );

  // Fetch member report
  const { data: memberReport } = useQuery(
    ["kanban-member-report", projectId, startDate, endDate],
    () =>
      getMemberReport({ projectId, start_date: startDate, end_date: endDate }),
    { enabled: !!projectId && !!startDate && !!endDate }
  );

  // Fetch time report
  const { data: timeReport } = useQuery(
    ["kanban-time-report", projectId, startDate, endDate],
    () =>
      getTimeReport({ projectId, start_date: startDate, end_date: endDate }),
    { enabled: !!projectId && !!startDate && !!endDate }
  );

  const stats = overview?.stats || {};
  const priorityDist = overview?.priority_distribution || [];

  const roleLabels = {
    owner: "Pemilik",
    admin: "Admin",
    member: "Anggota",
  };

  const memberColumns = [
    {
      title: "Anggota",
      dataIndex: "user",
      render: (user) => (
        <Group gap={8}>
          <Avatar src={user?.image} size={28} radius="xl">
            {user?.username?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Text size="sm">{user?.username}</Text>
        </Group>
      ),
    },
    {
      title: "Peran",
      dataIndex: "role",
      render: (role) => (
        <Badge
          size="sm"
          color={
            role === "owner" ? "blue" : role === "admin" ? "green" : "gray"
          }
        >
          {roleLabels[role] || role}
        </Badge>
      ),
    },
    {
      title: "Task Ditugaskan",
      dataIndex: ["stats", "total_assigned"],
      align: "center",
    },
    {
      title: "Selesai",
      dataIndex: ["stats", "completed"],
      align: "center",
    },
    {
      title: "Tingkat Penyelesaian",
      dataIndex: ["stats", "completion_rate"],
      render: (val) => (
        <Group gap={8}>
          <Progress
            value={val}
            size="sm"
            style={{ width: 60 }}
            color="orange"
          />
          <Text size="xs">{val}%</Text>
        </Group>
      ),
    },
    {
      title: "Aktivitas",
      dataIndex: ["stats", "activity_count"],
      align: "center",
    },
    {
      title: "Jam Tercatat",
      dataIndex: ["stats", "total_hours"],
      render: (val) => `${val || 0} jam`,
    },
  ];

  return (
    <>
      <Head>
        <title>Laporan - {project?.name} - Rumah ASN</title>
      </Head>

      <PageContainer
        loading={isLoadingProject || isLoadingOverview}
        title={`Laporan - ${project?.name || ""}`}
        subTitle="Lihat statistik dan laporan project"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/kanban">Kanban</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href={`/kanban/${projectId}`}>
                {project?.name || "Project"}
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Laporan</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <LayoutKanban projectId={projectId} active="reports">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "statistik",
                label: (
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <IconChartBar size={14} />
                    Statistik Project
                  </span>
                ),
                children: (
                  <Stack gap={20}>
                    {/* Date Filter & AI Summary */}
                    <Group justify="space-between">
                      <AIProjectSummary
                        projectId={projectId}
                        projectName={project?.name}
                      />
                      <RangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        format="DD MMM YYYY"
                      />
                    </Group>

                    {/* Kartu Statistik */}
                    <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
                      <StatCard
                        icon={IconChecklist}
                        label="Total Task"
                        value={stats.total_tasks || 0}
                        color="#228be6"
                        subValue={`${stats.completed_tasks || 0} selesai`}
                      />
                      <StatCard
                        icon={IconTrendingUp}
                        label="Tingkat Penyelesaian"
                        value={`${stats.completion_rate || 0}%`}
                        color="#40c057"
                      />
                      <StatCard
                        icon={IconAlertTriangle}
                        label="Terlambat"
                        value={stats.overdue_tasks || 0}
                        color="#fa5252"
                        subValue={`${
                          stats.due_today || 0
                        } jatuh tempo hari ini`}
                      />
                      <StatCard
                        icon={IconClock}
                        label="Jam Tercatat"
                        value={`${stats.total_actual_hours || 0}`}
                        color="#fab005"
                        subValue={`Estimasi: ${
                          stats.total_estimated_hours || 0
                        } jam`}
                      />
                    </SimpleGrid>

                    {/* Columns Progress */}
                    <Card title="Progress per Kolom">
                      <Stack gap={12}>
                        {overview?.columns?.map((col) => (
                          <Group key={col.id} justify="space-between">
                            <Group gap={8}>
                              <div
                                style={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: 3,
                                  backgroundColor: col.color,
                                }}
                              />
                              <Text size="sm">{col.name}</Text>
                            </Group>
                            <Badge>{col.task_count} task</Badge>
                          </Group>
                        ))}
                      </Stack>
                    </Card>

                    {/* Distribusi Prioritas */}
                    <Card title="Distribusi Prioritas (Task Aktif)">
                      <Group gap={24}>
                        {priorityDist.map((p) => {
                          const priorityLabels = {
                            urgent: "Mendesak",
                            high: "Tinggi",
                            medium: "Sedang",
                            low: "Rendah",
                          };
                          return (
                            <Group key={p.priority} gap={8}>
                              <Badge
                                color={
                                  p.priority === "urgent"
                                    ? "red"
                                    : p.priority === "high"
                                    ? "orange"
                                    : p.priority === "medium"
                                    ? "blue"
                                    : "gray"
                                }
                              >
                                {priorityLabels[p.priority] || p.priority}
                              </Badge>
                              <Text size="sm" fw={500}>
                                {p.count}
                              </Text>
                            </Group>
                          );
                        })}
                      </Group>
                    </Card>

                    {/* Member Report */}
                    <Card title="Aktivitas Anggota">
                      <Table
                        dataSource={memberReport?.members || []}
                        columns={memberColumns}
                        rowKey={(row) => row.user?.custom_id}
                        pagination={false}
                        size="small"
                      />
                    </Card>

                    {/* Time Summary */}
                    {timeReport && (
                      <Card title="Ringkasan Waktu">
                        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                          <Paper p="md" radius="md" bg="#f8f9fa">
                            <Stack gap={4}>
                              <Text size="xs" c="dimmed">
                                Total Jam Tercatat
                              </Text>
                              <Text size="xl" fw={700}>
                                {timeReport.summary?.total_hours || 0} jam
                              </Text>
                            </Stack>
                          </Paper>
                          <Paper p="md" radius="md" bg="#f8f9fa">
                            <Stack gap={4}>
                              <Text size="xs" c="dimmed">
                                Task dengan Log Waktu
                              </Text>
                              <Text size="xl" fw={700}>
                                {timeReport.summary?.tasks_with_time || 0}
                              </Text>
                            </Stack>
                          </Paper>
                          <Paper p="md" radius="md" bg="#f8f9fa">
                            <Stack gap={4}>
                              <Text size="xs" c="dimmed">
                                Kontributor
                              </Text>
                              <Text size="xl" fw={700}>
                                {timeReport.summary?.users_logged || 0}
                              </Text>
                            </Stack>
                          </Paper>
                        </SimpleGrid>
                      </Card>
                    )}
                  </Stack>
                ),
              },
              {
                key: "laporan-kegiatan",
                label: (
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <IconFileText size={14} />
                    Laporan Kegiatan
                  </span>
                ),
                children: <LaporanKegiatan projectId={projectId} />,
              },
              {
                key: "daftar-file",
                label: (
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <IconFiles size={14} />
                    Daftar File
                  </span>
                ),
                children: <ProjectFiles projectId={projectId} />,
              },
            ]}
          />
        </LayoutKanban>
      </PageContainer>
    </>
  );
}

ReportsPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

ReportsPage.Auth = {
  action: "manage",
  subject: "tickets",
};

export default ReportsPage;
