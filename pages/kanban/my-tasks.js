import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, Tag, Empty, Flex, Breadcrumb, Tabs } from "antd";
import { Stack, Text, Badge, Group } from "@mantine/core";
import {
  IconChecklist,
  IconUserCheck,
  IconPencil,
  IconCircleCheck,
} from "@tabler/icons-react";
import Head from "next/head";
import Link from "next/link";
import dayjs from "dayjs";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import PriorityBadge from "@/components/Kanban/PriorityBadge";
import DueDateBadge from "@/components/Kanban/DueDateBadge";
import {
  getMyTasks,
  getMyCreatedTasks,
  getMyCompletedTasks,
} from "../../services/kanban.services";

function MyTasksPage() {
  const [activeTab, setActiveTab] = useState("assigned");

  // Fetch all tasks on mount to show counts immediately
  const { data: assignedTasks, isLoading: isLoadingAssigned } = useQuery(
    ["kanban-my-tasks"],
    () => getMyTasks()
  );

  const { data: createdTasks, isLoading: isLoadingCreated } = useQuery(
    ["kanban-my-created-tasks"],
    () => getMyCreatedTasks()
  );

  const { data: completedTasks, isLoading: isLoadingCompleted } = useQuery(
    ["kanban-my-completed-tasks"],
    () => getMyCompletedTasks()
  );

  const baseColumns = [
    {
      title: "Task",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <Stack gap={2}>
          <Link href={`/kanban/${record.project?.id}`}>
            <Text size="sm" fw={500} style={{ cursor: "pointer" }}>
              {title}
            </Text>
          </Link>
          <Text size="xs" c="dimmed">
            {record.task_number}
          </Text>
        </Stack>
      ),
    },
    {
      title: "Project",
      dataIndex: "project",
      key: "project",
      render: (project) => (
        <Group gap={6}>
          <span>{project?.icon}</span>
          <Text size="sm">{project?.name}</Text>
        </Group>
      ),
    },
    {
      title: "Status",
      dataIndex: "column",
      key: "column",
      render: (column) => (
        <Badge
          size="sm"
          variant="light"
          style={{
            backgroundColor: `${column?.color}20`,
            color: column?.color,
          }}
        >
          {column?.name}
        </Badge>
      ),
    },
    {
      title: "Prioritas",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => <PriorityBadge priority={priority} />,
    },
    {
      title: "Deadline",
      dataIndex: "due_date",
      key: "due_date",
      render: (dueDate, record) =>
        dueDate ? (
          <DueDateBadge dueDate={dueDate} completedAt={record.completed_at} />
        ) : (
          <Text size="xs" c="dimmed">
            -
          </Text>
        ),
      sorter: (a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return dayjs(a.due_date).unix() - dayjs(b.due_date).unix();
      },
    },
    {
      title: "Labels",
      dataIndex: "labels",
      key: "labels",
      render: (labels) =>
        labels?.length > 0 ? (
          <Group gap={4}>
            {labels.slice(0, 2).map((label) => (
              <Tag key={label.id} color={label.color}>
                {label.name}
              </Tag>
            ))}
            {labels.length > 2 && (
              <Text size="xs" c="dimmed">
                +{labels.length - 2}
              </Text>
            )}
          </Group>
        ) : (
          <Text size="xs" c="dimmed">
            -
          </Text>
        ),
    },
  ];

  // Add completed_at column for completed tab
  const completedColumns = [
    ...baseColumns,
    {
      title: "Selesai",
      dataIndex: "completed_at",
      key: "completed_at",
      render: (completedAt) =>
        completedAt ? (
          <Text size="xs">{dayjs(completedAt).format("DD MMM YYYY")}</Text>
        ) : (
          <Text size="xs" c="dimmed">
            -
          </Text>
        ),
      sorter: (a, b) => {
        if (!a.completed_at) return 1;
        if (!b.completed_at) return -1;
        return dayjs(a.completed_at).unix() - dayjs(b.completed_at).unix();
      },
    },
  ];

  // Add created_at column for created tab
  const createdColumns = [
    ...baseColumns,
    {
      title: "Dibuat",
      dataIndex: "created_at",
      key: "created_at",
      render: (createdAt) =>
        createdAt ? (
          <Text size="xs">{dayjs(createdAt).format("DD MMM YYYY")}</Text>
        ) : (
          <Text size="xs" c="dimmed">
            -
          </Text>
        ),
      sorter: (a, b) => {
        if (!a.created_at) return 1;
        if (!b.created_at) return -1;
        return dayjs(b.created_at).unix() - dayjs(a.created_at).unix();
      },
    },
  ];

  const renderTable = (data, columns, emptyText) => {
    if (!data || data.length === 0) {
      return (
        <Flex justify="center" align="center" style={{ padding: "60px 0" }}>
          <Empty
            image={<IconChecklist size={48} color="#adb5bd" />}
            description={emptyText}
          />
        </Flex>
      );
    }

    return (
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        pagination={{
          pageSize: 20,
          showTotal: (total) => `${total} task`,
        }}
      />
    );
  };

  const isLoading =
    (activeTab === "assigned" && isLoadingAssigned) ||
    (activeTab === "created" && isLoadingCreated) ||
    (activeTab === "completed" && isLoadingCompleted);

  return (
    <>
      <Head>
        <title>Rumah ASN - Task Saya</title>
      </Head>

      <PageContainer
        loading={isLoading}
        title="Task Saya"
        subTitle="Kelola semua task yang terkait dengan Anda"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/kanban">Kanban</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Task Saya</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "assigned",
              label: (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <IconUserCheck size={14} />
                  Ditugaskan ({assignedTasks?.length || 0})
                </span>
              ),
              children: renderTable(
                assignedTasks,
                baseColumns,
                "Belum ada task yang ditugaskan kepada Anda"
              ),
            },
            {
              key: "created",
              label: (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <IconPencil size={14} />
                  Dibuat Saya ({createdTasks?.length || 0})
                </span>
              ),
              children: renderTable(
                createdTasks,
                createdColumns,
                "Belum ada task yang Anda buat"
              ),
            },
            {
              key: "completed",
              label: (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <IconCircleCheck size={14} />
                  Selesai ({completedTasks?.length || 0})
                </span>
              ),
              children: renderTable(
                completedTasks,
                completedColumns,
                "Belum ada task yang selesai"
              ),
            },
          ]}
          />
      </PageContainer>
    </>
  );
}

MyTasksPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

MyTasksPage.Auth = {
  action: "manage",
  subject: "tickets",
};

export default MyTasksPage;
