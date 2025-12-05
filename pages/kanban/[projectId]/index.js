import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message, Breadcrumb } from "antd";
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
} from "../../../services/kanban.services";

function KanbanBoardPage() {
  const router = useRouter();
  const { projectId } = router.query;
  const queryClient = useQueryClient();

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState(null);

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
          <KanbanBoard
            columns={columns}
            isLoading={isLoadingTasks}
            onDragEnd={handleDragEnd}
            onAddTask={handleAddTask}
            onTaskClick={handleTaskClick}
            onEditColumn={handleEditColumn}
            onDeleteColumn={handleDeleteColumn}
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
