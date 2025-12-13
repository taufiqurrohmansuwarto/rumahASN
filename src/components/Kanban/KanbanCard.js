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
          {/* Drag Handle - area khusus untuk drag */}
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

          {/* Content - klik untuk detail */}
          <div
            style={{ flex: 1, padding: 12, cursor: "pointer" }}
            onClick={() => onClick?.(task)}
          >
            {/* Overdue Warning */}
            {isOverdue && (
              <Flex
                gap={6}
                align="center"
                style={{
                  marginBottom: 8,
                  padding: "4px 8px",
                  backgroundColor: "#ff4d4f",
                  borderRadius: 4,
                  marginTop: -4,
                  marginLeft: -4,
                  marginRight: -4,
                }}
              >
                <IconAlertTriangle size={12} color="#fff" />
                <Text style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>
                  Terlambat {daysOverdue} hari
                </Text>
              </Flex>
            )}

            {/* Labels */}
            {task.labels?.length > 0 && (
              <Flex gap={4} wrap="wrap" style={{ marginBottom: 8 }}>
                {task.labels.slice(0, 3).map((label) => (
                  <LabelBadge key={label.id} label={label} />
                ))}
                {task.labels.length > 3 && (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    +{task.labels.length - 3}
                  </Text>
                )}
              </Flex>
            )}

            {/* Title */}
            <Text
              strong
              style={{
                fontSize: 13,
                display: "block",
                marginBottom: task.description ? 4 : 8,
                lineHeight: 1.4,
              }}
              ellipsis={{ rows: 2 }}
            >
              {task.title}
            </Text>

            {/* Description - truncated */}
            {task.description && (
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                  display: "block",
                  marginBottom: 8,
                  lineHeight: 1.4,
                }}
                ellipsis={{ rows: 1 }}
              >
                {task.description}
              </Text>
            )}

            {/* Subtask Progress */}
            {hasSubtasks && (
              <Flex gap={8} align="center" style={{ marginBottom: 8 }}>
                <Progress
                  percent={subtaskProgress}
                  size="small"
                  showInfo={false}
                  strokeColor={subtaskProgress === 100 ? "#52c41a" : "#fa541c"}
                  style={{ flex: 1, margin: 0 }}
                />
                <Text
                  type="secondary"
                  style={{ fontSize: 11, whiteSpace: "nowrap" }}
                >
                  {task.completed_subtask_count || 0}/{task.subtask_count}
                </Text>
              </Flex>
            )}

            {/* Meta: Priority & Due Date */}
            <Flex gap={6} wrap="wrap" align="center" style={{ marginBottom: 8 }}>
              <PriorityBadge priority={task.priority} />
              {task.due_date && (
                <DueDateBadge
                  dueDate={task.due_date}
                  completedAt={task.completed_at}
                />
              )}
            </Flex>

            {/* Footer: Stats & Assignees */}
            <Flex justify="space-between" align="center">
              <Flex gap={12} align="center">
                {hasComments && (
                  <Tooltip title={`${task.comment_count} komentar`}>
                    <Flex align="center" gap={4}>
                      <IconMessage size={14} color="#8c8c8c" />
                      <Text type="secondary" style={{ fontSize: 12, lineHeight: 1 }}>
                        {task.comment_count}
                      </Text>
                    </Flex>
                  </Tooltip>
                )}

                {hasAttachments && (
                  <Tooltip title={`${task.attachment_count} lampiran`}>
                    <Flex align="center" gap={4}>
                      <IconPaperclip size={14} color="#8c8c8c" />
                      <Text type="secondary" style={{ fontSize: 12, lineHeight: 1 }}>
                        {task.attachment_count}
                      </Text>
                    </Flex>
                  </Tooltip>
                )}
              </Flex>

              {assignees.length > 0 && (
                <ClickableAvatarGroup
                  users={assignees}
                  maxCount={3}
                  size={26}
                  showEmailIcon={true}
                />
              )}
            </Flex>
          </div>
        </Flex>
      </Card>
    </div>
  );
}

export default KanbanCard;
