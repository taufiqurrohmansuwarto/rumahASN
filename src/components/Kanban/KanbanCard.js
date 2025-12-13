import { useState } from "react";
import { Card, Typography, Tooltip, Flex, Progress } from "antd";
import {
  IconPaperclip,
  IconMessage,
  IconAlertTriangle,
  IconGripVertical,
} from "@tabler/icons-react";
import { useDraggable } from "@dnd-kit/core";
import dayjs from "dayjs";
import PriorityBadge from "./PriorityBadge";
import LabelBadge from "./LabelBadge";
import DueDateBadge from "./DueDateBadge";
import { ClickableAvatarGroup } from "./ClickableAvatar";

const { Text } = Typography;

function KanbanCard({ task, index, onClick, isDragging }) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggingNow,
  } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        marginBottom: 8,
        opacity: isDraggingNow ? 0.5 : 1,
        zIndex: isDraggingNow ? 1000 : 1,
      }
    : {
        marginBottom: 8,
      };

  const hasAttachments = task.attachment_count > 0;
  const hasComments = task.comment_count > 0;
  const hasSubtasks = task.subtask_count > 0;
  const subtaskProgress =
    hasSubtasks && task.subtask_count > 0
      ? Math.round(
          ((task.completed_subtask_count || 0) / task.subtask_count) * 100
        )
      : 0;

  const assignees = task.assignees || (task.assignee ? [task.assignee] : []);

  const isOverdue =
    task.due_date &&
    !task.completed_at &&
    dayjs(task.due_date).isBefore(dayjs(), "day");

  const daysOverdue = isOverdue ? dayjs().diff(dayjs(task.due_date), "day") : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        size="small"
        hoverable
        style={{
          borderRadius: 8,
          border:
            isDragging || isDraggingNow
              ? "2px solid #fa541c"
              : isOverdue
              ? "1px solid #ff4d4f"
              : "1px solid #f0f0f0",
          boxShadow:
            isDragging || isDraggingNow
              ? "0 8px 16px rgba(250, 84, 28, 0.15)"
              : isHovered
              ? "0 6px 16px rgba(0, 0, 0, 0.1)"
              : isOverdue
              ? "0 2px 8px rgba(255, 77, 79, 0.15)"
              : "0 1px 2px rgba(0,0,0,0.03)",
          backgroundColor: isOverdue ? "#fff2f0" : "#fff",
          transition: "all 0.2s ease",
          transform: isHovered && !isDraggingNow ? "translateY(-2px)" : "none",
        }}
        styles={{
          body: { padding: 0 },
        }}
      >
        <Flex>
          {/* Drag Handle */}
          <div
            {...listeners}
            {...attributes}
            style={{
              width: 24,
              minHeight: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isDraggingNow ? "grabbing" : "grab",
              backgroundColor: isHovered ? "#f5f5f5" : "#fafafa",
              borderRadius: "8px 0 0 8px",
              borderRight: "1px solid #f0f0f0",
              touchAction: "none",
              flexShrink: 0,
            }}
          >
            <IconGripVertical
              size={14}
              color={isHovered ? "#8c8c8c" : "#d9d9d9"}
              style={{ transition: "color 0.2s" }}
            />
          </div>

          {/* Content */}
          <div
            style={{ flex: 1, padding: 10, cursor: "pointer", minWidth: 0 }}
            onClick={() => onClick?.(task)}
          >
            {/* Overdue Warning */}
            {isOverdue && (
              <Flex
                gap={4}
                align="center"
                style={{
                  marginBottom: 6,
                  padding: "3px 6px",
                  backgroundColor: "#ff4d4f",
                  borderRadius: 4,
                  marginTop: -2,
                  marginLeft: -2,
                  marginRight: -2,
                }}
              >
                <IconAlertTriangle size={11} color="#fff" />
                <Text style={{ fontSize: 10, color: "#fff", fontWeight: 500 }}>
                  Terlambat {daysOverdue} hari
                </Text>
              </Flex>
            )}

            {/* Header: Assignees + Labels */}
            <Flex justify="space-between" align="center" style={{ marginBottom: 6 }}>
              {/* Labels */}
              <Flex gap={3} wrap="wrap" style={{ flex: 1, minWidth: 0 }}>
                {task.labels?.slice(0, 2).map((label) => (
                  <LabelBadge key={label.id} label={label} />
                ))}
                {task.labels?.length > 2 && (
                  <Text type="secondary" style={{ fontSize: 10 }}>
                    +{task.labels.length - 2}
                  </Text>
                )}
              </Flex>

              {/* Assignees - selalu tampil di kanan atas */}
              {assignees.length > 0 && (
                <div style={{ flexShrink: 0, marginLeft: 8 }}>
                  <ClickableAvatarGroup
                    users={assignees}
                    maxCount={2}
                    size={22}
                    showEmailIcon={false}
                  />
                </div>
              )}
            </Flex>

            {/* Title - dengan tooltip untuk judul panjang */}
            <Tooltip title={task.title} placement="topLeft" mouseEnterDelay={0.5}>
              <Text
                strong
                style={{
                  fontSize: 13,
                  display: "block",
                  marginBottom: 4,
                  lineHeight: 1.35,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {task.title}
              </Text>
            </Tooltip>

            {/* Description - dengan tooltip */}
            {task.description && (
              <Tooltip title={task.description} placement="topLeft" mouseEnterDelay={0.5}>
                <Text
                  type="secondary"
                  style={{
                    fontSize: 11,
                    display: "block",
                    marginBottom: 6,
                    lineHeight: 1.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {task.description}
                </Text>
              </Tooltip>
            )}

            {/* Subtask Progress */}
            {hasSubtasks && (
              <Flex gap={6} align="center" style={{ marginBottom: 6 }}>
                <Progress
                  percent={subtaskProgress}
                  size="small"
                  showInfo={false}
                  strokeColor={subtaskProgress === 100 ? "#52c41a" : "#fa541c"}
                  style={{ flex: 1, margin: 0 }}
                />
                <Text type="secondary" style={{ fontSize: 10, whiteSpace: "nowrap" }}>
                  {task.completed_subtask_count || 0}/{task.subtask_count}
                </Text>
              </Flex>
            )}

            {/* Footer: Priority, Due Date, Stats */}
            <Flex justify="space-between" align="center">
              <Flex gap={4} align="center" wrap="wrap">
                <PriorityBadge priority={task.priority} size="small" />
                {task.due_date && (
                  <DueDateBadge
                    dueDate={task.due_date}
                    completedAt={task.completed_at}
                    size="small"
                  />
                )}
              </Flex>

              {/* Stats */}
              <Flex gap={8} align="center">
                {hasComments && (
                  <Tooltip title={`${task.comment_count} komentar`}>
                    <Flex align="center" gap={2}>
                      <IconMessage size={12} color="#8c8c8c" />
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        {task.comment_count}
                      </Text>
                    </Flex>
                  </Tooltip>
                )}

                {hasAttachments && (
                  <Tooltip title={`${task.attachment_count} lampiran`}>
                    <Flex align="center" gap={2}>
                      <IconPaperclip size={12} color="#8c8c8c" />
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        {task.attachment_count}
                      </Text>
                    </Flex>
                  </Tooltip>
                )}
              </Flex>
            </Flex>
          </div>
        </Flex>
      </Card>
    </div>
  );
}

export default KanbanCard;
