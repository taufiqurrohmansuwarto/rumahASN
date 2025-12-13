import { useState } from "react";
import { Spin, Empty, Typography, Flex } from "antd";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
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

  // Sensors untuk desktop dan mobile/tablet
  const mouseSensor = useSensor(MouseSensor, {
    // Butuh geser 5px sebelum drag dimulai (mencegah klik tidak sengaja)
    activationConstraint: {
      distance: 5,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    // Delay 150ms sebelum drag dimulai (mencegah scroll tidak sengaja)
    // Tolerance 5px - jika bergerak lebih dari 5px sebelum delay, batal drag
    activationConstraint: {
      delay: 150,
      tolerance: 5,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

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
          WebkitOverflowScrolling: "touch", // Smooth horizontal scroll di iOS
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

      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
      >
        {activeTask ? (
          <div
            style={{
              width: 280,
              opacity: 0.95,
              transform: "rotate(3deg) scale(1.02)",
              boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
              cursor: "grabbing",
            }}
          >
            <KanbanCard task={activeTask} index={0} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default KanbanBoard;
