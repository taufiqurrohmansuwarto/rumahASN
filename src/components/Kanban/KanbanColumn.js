import { Card, Button, Badge, Dropdown, Typography, Flex, Tooltip } from "antd";
import {
  IconPlus,
  IconDots,
  IconEdit,
  IconTrash,
  IconSettings,
} from "@tabler/icons-react";
import { useDroppable } from "@dnd-kit/core";
import KanbanCard from "./KanbanCard";

const { Text } = Typography;

function KanbanColumn({
  column,
  onAddTask,
  onTaskClick,
  onEditColumn,
  onDeleteColumn,
}) {
  const taskCount = column.tasks?.length || 0;
  const wipLimit = column.wip_limit;
  const isOverWip = wipLimit && taskCount > wipLimit;

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const menuItems = [
    {
      key: "edit",
      label: "Edit Kolom",
      icon: <IconEdit size={14} />,
      onClick: () => onEditColumn?.(column),
    },
    {
      key: "settings",
      label: "Pengaturan",
      icon: <IconSettings size={14} />,
      onClick: () => onEditColumn?.(column),
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      label: "Hapus Kolom",
      icon: <IconTrash size={14} />,
      danger: true,
      onClick: () => onDeleteColumn?.(column),
    },
  ];

  return (
    <Card
      size="small"
      style={{
        minWidth: 300,
        maxWidth: 300,
        backgroundColor: "#fafafa",
        display: "flex",
        flexDirection: "column",
        maxHeight: "calc(100vh - 220px)",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #f0f0f0",
      }}
      styles={{
        body: { padding: 0, display: "flex", flexDirection: "column", flex: 1 },
      }}
    >
      {/* Orange Accent Top */}
      <div
        style={{
          height: 3,
          background: column.color || "#6B7280",
        }}
      />

      {/* Column Header */}
      <div
        style={{
          padding: "12px 12px 8px 12px",
          borderBottom: "1px solid #f0f0f0",
          backgroundColor: "#fff",
        }}
      >
        <Flex justify="space-between" align="center">
          <Flex gap={8} align="center">
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                backgroundColor: column.color || "#6B7280",
              }}
            />
            <Text strong style={{ fontSize: 13, maxWidth: 160 }} ellipsis>
              {column.name}
            </Text>
            <Badge
              count={wipLimit ? `${taskCount}/${wipLimit}` : taskCount}
              showZero
              style={{
                backgroundColor: isOverWip ? "#ff4d4f" : "#f5f5f5",
                color: isOverWip ? "#fff" : "#8c8c8c",
                fontSize: 11,
                fontWeight: 500,
              }}
            />
          </Flex>

          <Flex gap={4}>
            <Tooltip title="Tambah task">
              <Button
                type="text"
                size="small"
                icon={<IconPlus size={14} />}
                onClick={() => onAddTask?.(column)}
                style={{ color: "#8c8c8c" }}
              />
            </Tooltip>
            <Dropdown
              menu={{ items: menuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                size="small"
                icon={<IconDots size={14} />}
                style={{ color: "#8c8c8c" }}
              />
            </Dropdown>
          </Flex>
        </Flex>

        {isOverWip && (
          <Text type="danger" style={{ fontSize: 11, marginTop: 4 }}>
            Melebihi batas WIP ({wipLimit})
          </Text>
        )}
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          padding: 8,
          overflowY: "auto",
          minHeight: 100,
          backgroundColor: isOver ? "#fff7e6" : "transparent",
          transition: "background-color 0.2s ease",
        }}
      >
        {column.tasks?.length === 0 && !isOver && (
          <Flex
            justify="center"
            align="center"
            style={{
              padding: 24,
              color: "#bfbfbf",
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              Belum ada task
            </Text>
          </Flex>
        )}

        {column.tasks?.map((task, index) => (
          <KanbanCard
            key={task.id}
            task={task}
            index={index}
            onClick={onTaskClick}
          />
        ))}
      </div>

      {/* Add Task Footer */}
      <div
        style={{
          padding: 8,
          borderTop: "1px solid #f0f0f0",
          backgroundColor: "#fff",
        }}
      >
        <Button
          type="text"
          size="small"
          icon={<IconPlus size={14} />}
          onClick={() => onAddTask?.(column)}
          style={{
            width: "100%",
            color: "#8c8c8c",
            textAlign: "left",
            justifyContent: "flex-start",
          }}
        >
          Tambah task
        </Button>
      </div>
    </Card>
  );
}

export default KanbanColumn;
