import { useState } from "react";
import { Button, Badge, Typography, Flex, Tooltip } from "antd";
import {
  IconPlus,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { useDroppable } from "@dnd-kit/core";
import KanbanCard from "./KanbanCard";

const { Text } = Typography;

function KanbanColumn({ column, onAddTask, onTaskClick, isMobile = false }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const taskCount = column.tasks?.length || 0;
  const wipLimit = column.wip_limit;
  const isOverWip = wipLimit && taskCount > wipLimit;

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      style={{
        minWidth: isMobile ? "100%" : 300,
        maxWidth: isMobile ? "100%" : 300,
        width: isMobile ? "100%" : 300,
        backgroundColor: "#fafafa",
        display: "flex",
        flexDirection: "column",
        height: isMobile
          ? isCollapsed
            ? "auto"
            : "auto"
          : "calc(100vh - 220px)",
        maxHeight: isMobile ? (isCollapsed ? "auto" : 400) : "none",
        borderRadius: 12,
        border: "1px solid #f0f0f0",
        flexShrink: 0,
      }}
    >
      {/* Column Header */}
      <div
        style={{
          padding: "12px 12px 8px 12px",
          borderBottom: "1px solid #f0f0f0",
          backgroundColor: "#fff",
          borderRadius: "12px 12px 0 0",
          flexShrink: 0,
          borderTop: `4px solid ${column.color || "#6B7280"}`,
          cursor: isMobile ? "pointer" : "default",
        }}
        onClick={() => isMobile && setIsCollapsed(!isCollapsed)}
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
            <Text strong style={{ fontSize: 13, maxWidth: isMobile ? 200 : 160 }} ellipsis>
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
            {isMobile && (
              <Button
                type="text"
                size="small"
                icon={
                  isCollapsed ? (
                    <IconChevronDown size={14} />
                  ) : (
                    <IconChevronUp size={14} />
                  )
                }
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCollapsed(!isCollapsed);
                }}
                style={{ color: "#8c8c8c" }}
              />
            )}
            <Tooltip title="Tambah task">
              <Button
                type="text"
                size="small"
                icon={<IconPlus size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTask?.(column);
                }}
                style={{ color: "#8c8c8c" }}
              />
            </Tooltip>
          </Flex>
        </Flex>

        {isOverWip && (
          <Text type="danger" style={{ fontSize: 11, marginTop: 4 }}>
            Melebihi batas WIP ({wipLimit})
          </Text>
        )}
      </div>

      {/* Droppable Area - Collapsible on mobile */}
      {!isCollapsed && (
        <>
          <div
            ref={setNodeRef}
            style={{
              flex: 1,
              padding: 8,
              overflowY: "auto",
              overflowX: "hidden",
              minHeight: isMobile ? 100 : 0,
              maxHeight: isMobile ? 300 : "none",
              backgroundColor: isOver ? "#fff7e6" : "transparent",
              transition: "background-color 0.2s ease",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {column.tasks?.length === 0 && !isOver && (
              <Flex
                justify="center"
                align="center"
                style={{
                  padding: isMobile ? 16 : 24,
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
              borderRadius: "0 0 12px 12px",
              flexShrink: 0,
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
        </>
      )}
    </div>
  );
}

export default KanbanColumn;
