import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message, Breadcrumb, Input, Select, Button, DatePicker, Flex } from "antd";
import { Group, Avatar, Text } from "@mantine/core";
import { IconSearch, IconX, IconFilter, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import dayjs from "dayjs";
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
  const [filterCreatedDate, setFilterCreatedDate] = useState(null);
  const [filterDueDate, setFilterDueDate] = useState(null);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

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
    if (!searchText && !filterAssignee && !filterCreatedDate && !filterDueDate) return columns;

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

        // Filter by created date range
        const matchesCreatedDate =
          !filterCreatedDate ||
          (task.created_at &&
            dayjs(task.created_at).isAfter(dayjs(filterCreatedDate[0]).startOf("day").subtract(1, "second")) &&
            dayjs(task.created_at).isBefore(dayjs(filterCreatedDate[1]).endOf("day").add(1, "second")));

        // Filter by due date range
        const matchesDueDate =
          !filterDueDate ||
          (task.due_date &&
            dayjs(task.due_date).isAfter(dayjs(filterDueDate[0]).startOf("day").subtract(1, "second")) &&
            dayjs(task.due_date).isBefore(dayjs(filterDueDate[1]).endOf("day").add(1, "second")));

        return matchesSearch && matchesAssignee && matchesCreatedDate && matchesDueDate;
      }),
    }));
  }, [columns, searchText, filterAssignee, filterCreatedDate, filterDueDate]);

  const hasActiveFilters = searchText || filterAssignee || filterCreatedDate || filterDueDate;
  const advancedFilterCount = (filterCreatedDate ? 1 : 0) + (filterDueDate ? 1 : 0);

  const clearFilters = () => {
    setSearchText("");
    setFilterAssignee(null);
    setFilterCreatedDate(null);
    setFilterDueDate(null);
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
          <Flex gap={8} wrap="wrap" align="center" style={{ marginBottom: 12 }}>
            <Input
              placeholder="Cari task..."
              prefix={<IconSearch size={14} color="#bfbfbf" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 180 }}
              size="small"
              allowClear
            />
            <Select
              placeholder="Penugasan"
              value={filterAssignee}
              onChange={setFilterAssignee}
              allowClear
              showSearch
              size="small"
              optionFilterProp="label"
              filterOption={(input, option) =>
                option?.searchLabel?.toLowerCase().includes(input.toLowerCase())
              }
              style={{ width: 160 }}
              options={members?.map((m) => ({
                value: m.user?.custom_id,
                searchLabel: m.user?.username,
                label: (
                  <Flex align="center" gap={6}>
                    <Avatar src={m.user?.image} size={18} radius="xl">
                      {m.user?.username?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <span style={{ fontSize: 13 }}>{m.user?.username}</span>
                  </Flex>
                ),
              }))}
            />
            <Button
              type="text"
              size="small"
              icon={<IconFilter size={14} />}
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              style={{
                color: advancedFilterCount > 0 ? "#fa541c" : "#8c8c8c",
              }}
            >
              {advancedFilterCount > 0 ? `Filter (${advancedFilterCount})` : "Filter"}
              {showAdvancedFilter ? (
                <IconChevronUp size={12} style={{ marginLeft: 2 }} />
              ) : (
                <IconChevronDown size={12} style={{ marginLeft: 2 }} />
              )}
            </Button>
            {hasActiveFilters && (
              <Button
                type="link"
                size="small"
                icon={<IconX size={12} />}
                onClick={clearFilters}
                style={{ color: "#ff4d4f", padding: "0 4px" }}
              >
                Reset
              </Button>
            )}
          </Flex>

          {/* Advanced Filters */}
          {showAdvancedFilter && (
            <Flex gap={8} wrap="wrap" align="center" style={{ marginBottom: 12 }}>
              <DatePicker.RangePicker
                placeholder={["Dibuat dari", "sampai"]}
                value={filterCreatedDate}
                onChange={setFilterCreatedDate}
                format="DD/MM/YY"
                size="small"
                style={{ width: 200 }}
                allowClear
                presets={[
                  { label: "Hari ini", value: [dayjs(), dayjs()] },
                  { label: "Minggu ini", value: [dayjs().startOf("week"), dayjs()] },
                  { label: "Bulan ini", value: [dayjs().startOf("month"), dayjs()] },
                ]}
              />
              <DatePicker.RangePicker
                placeholder={["Deadline dari", "sampai"]}
                value={filterDueDate}
                onChange={setFilterDueDate}
                format="DD/MM/YY"
                size="small"
                style={{ width: 200 }}
                allowClear
                presets={[
                  { label: "Hari ini", value: [dayjs(), dayjs()] },
                  { label: "Minggu ini", value: [dayjs().startOf("week"), dayjs().endOf("week")] },
                  { label: "Bulan ini", value: [dayjs().startOf("month"), dayjs().endOf("month")] },
                  { label: "Overdue", value: [dayjs("2020-01-01"), dayjs().subtract(1, "day")] },
                ]}
              />
            </Flex>
          )}

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
