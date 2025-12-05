import { useState } from "react";
import { Spin, Empty, Typography, Flex } from "antd";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { IconLayoutKanban } from "@tabler/icons-react";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";

const { Text } = Typography;

function KanbanBoard({
  columns,
  isLoading,
  onDragEnd,
  onAddTask,
  onTaskClick,
  onEditColumn,
  onDeleteColumn,
}) {
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ height: 400 }}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (!columns || columns.length === 0) {
    return (
      <Flex justify="center" align="center" style={{ height: 400 }}>
        <Empty
          image={<IconLayoutKanban size={48} color="#d9d9d9" />}
          imageStyle={{ height: 60 }}
          description={
            <Text type="secondary">
              Belum ada kolom. Tambahkan kolom di Pengaturan.
            </Text>
          }
        />
      </Flex>
    );
  }

  const findTask = (taskId) => {
    for (const column of columns) {
      const task = column.tasks?.find((t) => t.id === taskId);
      if (task) return task;
    }
    return null;
  };

  const findColumnByTaskId = (taskId) => {
    for (const column of columns) {
      if (column.tasks?.some((t) => t.id === taskId)) {
        return column;
      }
    }
    return null;
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = findTask(active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find source column
    const sourceColumn = findColumnByTaskId(activeId);
    if (!sourceColumn) return;

    // Determine destination column
    let destColumn = columns.find((c) => c.id === overId);
    if (!destColumn) {
      destColumn = findColumnByTaskId(overId);
    }
    if (!destColumn) return;

    // Calculate destination index
    let destinationIndex = 0;
    if (destColumn.tasks?.length > 0) {
      const overIndex = destColumn.tasks.findIndex((t) => t.id === overId);
      if (overIndex !== -1) {
        destinationIndex = overIndex;
      } else {
        destinationIndex = destColumn.tasks.length;
      }
    }

    // Skip if same position
    if (sourceColumn.id === destColumn.id) {
      const sourceIndex = sourceColumn.tasks.findIndex((t) => t.id === activeId);
      if (sourceIndex === destinationIndex) return;
    }

    onDragEnd?.({
      taskId: activeId,
      sourceColumnId: sourceColumn.id,
      destinationColumnId: destColumn.id,
      sourceIndex: sourceColumn.tasks.findIndex((t) => t.id === activeId),
      destinationIndex,
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          overflowY: "hidden",
          paddingBottom: 16,
          paddingRight: 16,
          minHeight: "calc(100vh - 280px)",
          marginLeft: -24,
          marginRight: -24,
          paddingLeft: 24,
        }}
      >
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onAddTask={onAddTask}
            onTaskClick={onTaskClick}
            onEditColumn={onEditColumn}
            onDeleteColumn={onDeleteColumn}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div style={{ width: 280, opacity: 0.95 }}>
            <KanbanCard task={activeTask} index={0} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default KanbanBoard;
