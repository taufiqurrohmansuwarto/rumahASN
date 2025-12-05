import { useQuery } from "@tanstack/react-query";
import { Table, Tag, Empty, Flex, Breadcrumb } from "antd";
import { Stack, Text, Badge, Group } from "@mantine/core";
import { IconChecklist } from "@tabler/icons-react";
import Head from "next/head";
import Link from "next/link";
import dayjs from "dayjs";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import PriorityBadge from "@/components/Kanban/PriorityBadge";
import DueDateBadge from "@/components/Kanban/DueDateBadge";
import { getMyTasks } from "../../services/kanban.services";

function MyTasksPage() {
  const { data: tasks, isLoading } = useQuery(["kanban-my-tasks"], () =>
    getMyTasks()
  );

  const columns = [
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

  return (
    <>
      <Head>
        <title>Rumah ASN - Task Saya</title>
      </Head>

      <PageContainer
        loading={isLoading}
        title="Task Saya"
        subTitle="Daftar task yang di-assign kepada Anda"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/kanban">Kanban</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Task Saya</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        {tasks?.length === 0 ? (
          <Flex justify="center" align="center" style={{ padding: "60px 0" }}>
            <Empty
              image={<IconChecklist size={48} color="#adb5bd" />}
              description="Belum ada task yang di-assign kepada Anda"
            />
          </Flex>
        ) : (
          <Table
            dataSource={tasks}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 20,
              showTotal: (total) => `${total} task`,
            }}
          />
        )}
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
