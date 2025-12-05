import { useQuery } from "@tanstack/react-query";
import { Timeline, Typography, Avatar, Spin, Empty, Flex, Tag } from "antd";
import {
  IconArrowRight,
  IconPlus,
  IconEdit,
  IconTrash,
  IconUserPlus,
  IconFlag,
  IconCalendar,
  IconSubtask,
  IconPaperclip,
  IconMessage,
  IconHistory,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import { getActivityLog } from "../../../services/kanban.services";

dayjs.extend(relativeTime);
dayjs.locale("id");

const { Text } = Typography;

// Map action to icon and color
const getActionConfig = (action) => {
  const configs = {
    created: {
      icon: <IconPlus size={12} />,
      color: "#52c41a",
      label: "membuat task",
    },
    moved: {
      icon: <IconArrowRight size={12} />,
      color: "#1890ff",
      label: "memindahkan task",
    },
    updated: {
      icon: <IconEdit size={12} />,
      color: "#fa8c16",
      label: "mengupdate task",
    },
    completed: {
      icon: <IconFlag size={12} />,
      color: "#52c41a",
      label: "menyelesaikan task",
    },
    assigned: {
      icon: <IconUserPlus size={12} />,
      color: "#722ed1",
      label: "menugaskan task",
    },
    unassigned: {
      icon: <IconUserPlus size={12} />,
      color: "#8c8c8c",
      label: "menghapus penugasan",
    },
    priority_changed: {
      icon: <IconFlag size={12} />,
      color: "#fa541c",
      label: "mengubah prioritas",
    },
    due_date_changed: {
      icon: <IconCalendar size={12} />,
      color: "#13c2c2",
      label: "mengubah deadline",
    },
    subtask_added: {
      icon: <IconSubtask size={12} />,
      color: "#2f54eb",
      label: "menambah subtask",
    },
    subtask_completed: {
      icon: <IconSubtask size={12} />,
      color: "#52c41a",
      label: "menyelesaikan subtask",
    },
    attachment_added: {
      icon: <IconPaperclip size={12} />,
      color: "#eb2f96",
      label: "menambah lampiran",
    },
    comment_added: {
      icon: <IconMessage size={12} />,
      color: "#faad14",
      label: "menambah komentar",
    },
  };

  return (
    configs[action] || {
      icon: <IconHistory size={12} />,
      color: "#8c8c8c",
      label: action,
    }
  );
};

// Parse JSON value safely
const parseValue = (value) => {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

// Format activity detail
const formatActivityDetail = (activity) => {
  const { action } = activity;
  const old_value = parseValue(activity.old_value);
  const new_value = parseValue(activity.new_value);

  if (action === "moved" && (old_value?.column_id || new_value?.column_id)) {
    return (
      <Flex gap={4} align="center" wrap="wrap">
        <Tag size="small" style={{ margin: 0 }}>
          {old_value?.column_name || "Kolom"}
        </Tag>
        <IconArrowRight size={12} color="#8c8c8c" />
        <Tag size="small" color="blue" style={{ margin: 0 }}>
          {new_value?.column_name || "Kolom"}
        </Tag>
      </Flex>
    );
  }

  if (action === "priority_changed") {
    const priorityLabels = {
      low: "Rendah",
      medium: "Sedang",
      high: "Tinggi",
      urgent: "Mendesak",
    };
    return (
      <Flex gap={4} align="center">
        <Tag size="small" style={{ margin: 0 }}>
          {priorityLabels[old_value?.priority] || "-"}
        </Tag>
        <IconArrowRight size={12} color="#8c8c8c" />
        <Tag size="small" color="orange" style={{ margin: 0 }}>
          {priorityLabels[new_value?.priority] || "-"}
        </Tag>
      </Flex>
    );
  }

  if (action === "due_date_changed") {
    return (
      <Flex gap={4} align="center">
        <Text type="secondary" style={{ fontSize: 11 }}>
          {old_value?.due_date
            ? dayjs(old_value.due_date).format("DD MMM")
            : "-"}
        </Text>
        <IconArrowRight size={12} color="#8c8c8c" />
        <Text style={{ fontSize: 11 }}>
          {new_value?.due_date
            ? dayjs(new_value.due_date).format("DD MMM YYYY")
            : "-"}
        </Text>
      </Flex>
    );
  }

  if (action === "subtask_added" && new_value?.title) {
    return (
      <Text type="secondary" style={{ fontSize: 11 }}>
        "{new_value.title}"
      </Text>
    );
  }

  if (action === "attachment_added" && new_value?.filename) {
    return (
      <Text type="secondary" style={{ fontSize: 11 }}>
        "{new_value.filename}"
      </Text>
    );
  }

  return null;
};

function TaskActivities({ taskId, activities: initialActivities }) {
  // Use initial activities from task or fetch separately if needed
  const activities = initialActivities || [];

  if (!activities || activities.length === 0) {
    return (
      <div style={{ padding: "12px 16px 24px 16px" }}>
        <Empty
          image={<IconHistory size={32} color="#d9d9d9" />}
          imageStyle={{ height: 32 }}
          description={
            <Text type="secondary" style={{ fontSize: 12 }}>
              Belum ada aktivitas
            </Text>
          }
          style={{ margin: "24px 0" }}
        />
      </div>
    );
  }

  // Sort by created_at descending
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const timelineItems = sortedActivities.map((activity) => {
    const config = getActionConfig(activity.action);
    const detail = formatActivityDetail(activity);

    return {
      key: activity.id,
      dot: (
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: `${config.color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: config.color,
          }}
        >
          {config.icon}
        </div>
      ),
      children: (
        <div style={{ paddingBottom: 8 }}>
          <Flex gap={6} align="center" wrap="wrap">
            <Avatar src={activity.user?.image} size={20}>
              {activity.user?.username?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Text strong style={{ fontSize: 12 }}>
              {activity.user?.username || "User"}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {config.label}
            </Text>
          </Flex>

          {detail && (
            <div style={{ marginTop: 4, marginLeft: 26 }}>{detail}</div>
          )}

          <Text
            type="secondary"
            style={{
              fontSize: 11,
              display: "block",
              marginTop: 4,
              marginLeft: 26,
            }}
          >
            {dayjs(activity.created_at).fromNow()}
            {" • "}
            {dayjs(activity.created_at).format("DD MMM YYYY HH:mm")}
          </Text>
        </div>
      ),
    };
  });

  return (
    <div style={{ padding: "12px 16px 24px 16px" }}>
      <Timeline items={timelineItems} />
    </div>
  );
}

export default TaskActivities;
