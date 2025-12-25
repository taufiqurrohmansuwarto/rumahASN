import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message, Breadcrumb, Input, Select, Space, Button } from "antd";
import { Group, Avatar, Text } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import Head from "next/head";
import Link from "next/link";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import LayoutKanban from "@/components/Kanban/LayoutKanban";
import KanbanBoard from "@/components/Kanban/KanbanBoard";
import TaskDetailDrawer from "@/components/Kanban/TaskDetailDrawer";
import CreateTaskModal from "@/components/Kanban/CreateTaskModal";
import {
  getProject,
  getTasks,
  moveTask,
  getLabels,
  getMembers,
} from "../../../services/kanban.services";

function KanbanBoardPage() {
  const router = useRouter();
  const { projectId } = router.query;
  const queryClient = useQueryClient();

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState(null);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [filterAssignee, setFilterAssignee] = useState(null);

  // Fetch project details
  const { data: project, isLoading: isLoadingProject } = useQuery(
    ["kanban-project", projectId],
    () => getProject(projectId),
    { enabled: !!projectId }
  );

  // Fetch board data (columns with tasks)
  const { data: columns, isLoading: isLoadingTasks } = useQuery(
    ["kanban-tasks", projectId],
    () => getTasks(projectId),
    { enabled: !!projectId }
  );

  // Fetch labels
  const { data: labels } = useQuery(
    ["kanban-labels", projectId],
    () => getLabels(projectId),
    { enabled: !!projectId }
  );

  // Fetch members for filter
  const { data: members } = useQuery(
    ["kanban-members", projectId],
    () => getMembers(projectId),
    { enabled: !!projectId }
  );

  // Filter columns and tasks
  const filteredColumns = useMemo(() => {
    if (!columns) return columns;
    if (!searchText && !filterAssignee) return columns;

    return columns.map((column) => ({
      ...column,
      tasks: column.tasks?.filter((task) => {
        // Filter by search text (title or description)
        const matchesSearch =
          !searchText ||
          task.title?.toLowerCase().includes(searchText.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchText.toLowerCase());

        // Filter by assignee
        const matchesAssignee =
          !filterAssignee ||
          task.assignees?.some((a) => a.custom_id === filterAssignee) ||
          task.assigned_to === filterAssignee;

        return matchesSearch && matchesAssignee;
      }),
    }));
  }, [columns, searchText, filterAssignee]);

  const hasActiveFilters = searchText || filterAssignee;

  const clearFilters = () => {
    setSearchText("");
    setFilterAssignee(null);
  };

  // Move task mutation
  const { mutate: move } = useMutation(
    ({ taskId, column_id, position }) =>
      moveTask({ taskId, column_id, position }),
    {
      onMutate: async ({ taskId, column_id, position }) => {
        await queryClient.cancelQueries(["kanban-tasks", projectId]);

        const previousColumns = queryClient.getQueryData([
          "kanban-tasks",
          projectId,
        ]);

        queryClient.setQueryData(["kanban-tasks", projectId], (old) => {
          if (!old) return old;

          const newColumns = JSON.parse(JSON.stringify(old));

          let movedTask = null;
          for (const col of newColumns) {
            const taskIndex = col.tasks?.findIndex((t) => t.id === taskId);
            if (taskIndex !== undefined && taskIndex !== -1) {
              movedTask = col.tasks.splice(taskIndex, 1)[0];
              break;
            }
          }

          if (movedTask) {
            const destCol = newColumns.find((c) => c.id === column_id);
            if (destCol) {
              if (!destCol.tasks) destCol.tasks = [];
              destCol.tasks.splice(position, 0, movedTask);
            }
          }

          return newColumns;
        });

        return { previousColumns };
      },
      onError: (err, variables, context) => {
        queryClient.setQueryData(
          ["kanban-tasks", projectId],
          context.previousColumns
        );
        message.error("Gagal memindahkan task");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["kanban-tasks", projectId]);
      },
    }
  );

  const handleDragEnd = useCallback(
    ({ taskId, destinationColumnId, destinationIndex }) => {
      move({
        taskId,
        column_id: destinationColumnId,
        position: destinationIndex,
      });
    },
    [move]
  );

  const handleTaskClick = useCallback((task) => {
    setSelectedTaskId(task.id);
    setDrawerOpen(true);
  }, []);

  const handleAddTask = useCallback((column) => {
    setSelectedColumnId(column.id);
    setCreateTaskOpen(true);
  }, []);

  const handleEditColumn = useCallback(
    (column) => {
      router.push(`/kanban/${projectId}/settings?tab=columns`);
    },
    [router, projectId]
  );

  const handleDeleteColumn = useCallback(
    (column) => {
      router.push(`/kanban/${projectId}/settings?tab=columns`);
    },
    [router, projectId]
  );

  return (
    <>
      <Head>
        <title>{project?.name || "Kanban Board"} - Rumah ASN</title>
      </Head>

      <PageContainer
        loading={isLoadingProject}
        title={project?.name}
        subTitle="Manajemen Project Kanban"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/kanban">Kanban</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{project?.name || "Project"}</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <LayoutKanban projectId={projectId} active="board">
          {/* Filter Bar */}
          <Space wrap style={{ marginBottom: 16 }}>
            <Input
              placeholder="Cari task..."
              prefix={<IconSearch size={16} color="#bfbfbf" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              placeholder="Filter Penugasan"
              value={filterAssignee}
              onChange={setFilterAssignee}
              allowClear
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                option?.searchLabel
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              style={{ width: 280 }}
              options={members?.map((m) => ({
                value: m.user?.custom_id,
                searchLabel: m.user?.username,
                label: (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      maxWidth: 240,
                    }}
                  >
                    <Avatar
                      src={m.user?.image}
                      size={20}
                      radius="xl"
                      style={{ flexShrink: 0 }}
                    >
                      {m.user?.username?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: 14,
                      }}
                    >
                      {m.user?.username}
                    </span>
                  </div>
                ),
              }))}
            />
            {hasActiveFilters && (
              <Button
                type="text"
                icon={<IconX size={14} />}
                onClick={clearFilters}
                size="small"
              >
                Reset Filter
              </Button>
            )}
          </Space>

          <KanbanBoard
            columns={filteredColumns}
            isLoading={isLoadingTasks}
            onDragEnd={handleDragEnd}
            onAddTask={handleAddTask}
            onTaskClick={handleTaskClick}
          />
        </LayoutKanban>
      </PageContainer>

      <TaskDetailDrawer
        taskId={selectedTaskId}
        projectId={projectId}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedTaskId(null);
        }}
        members={project?.members}
      />

      <CreateTaskModal
        open={createTaskOpen}
        onClose={() => {
          setCreateTaskOpen(false);
          setSelectedColumnId(null);
        }}
        projectId={projectId}
        columnId={selectedColumnId}
        columns={columns}
        members={project?.members}
        labels={labels}
      />
    </>
  );
}

KanbanBoardPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

KanbanBoardPage.Auth = {
  action: "manage",
  subject: "tickets",
};

export default KanbanBoardPage;
