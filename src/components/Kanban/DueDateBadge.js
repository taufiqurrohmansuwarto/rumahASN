import { Tag, Tooltip } from "antd";
import { IconClock } from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

dayjs.extend(relativeTime);
dayjs.locale("id");

function DueDateBadge({ dueDate, completedAt }) {
  if (!dueDate) return null;

  const now = dayjs();
  const due = dayjs(dueDate);
  const isCompleted = !!completedAt;
  const isOverdue = !isCompleted && due.isBefore(now, "day");
  const isDueToday = due.isSame(now, "day");
  const isDueTomorrow = due.isSame(now.add(1, "day"), "day");

  let color = "default";
  let label = due.format("DD MMM");

  if (isCompleted) {
    color = "green";
    label = `Selesai`;
  } else if (isOverdue) {
    color = "red";
    label = `Terlambat`;
  } else if (isDueToday) {
    color = "orange";
    label = "Hari ini";
  } else if (isDueTomorrow) {
    color = "gold";
    label = "Besok";
  }

  return (
    <Tooltip title={due.format("dddd, DD MMMM YYYY")}>
      <Tag
        color={color}
        icon={<IconClock size={10} style={{ marginRight: 2 }} />}
        style={{
          margin: 0,
          fontSize: 10,
          lineHeight: "16px",
          padding: "0 6px",
          borderRadius: 4,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        {label}
      </Tag>
    </Tooltip>
  );
}

export default DueDateBadge;
