import { Tag } from "antd";

const priorityConfig = {
  low: { color: "default", label: "Rendah" },
  medium: { color: "blue", label: "Sedang" },
  high: { color: "orange", label: "Tinggi" },
  urgent: { color: "red", label: "Mendesak" },
};

function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <Tag
      color={config.color}
      style={{
        margin: 0,
        fontSize: 10,
        lineHeight: "16px",
        padding: "0 6px",
        borderRadius: 4,
      }}
    >
      {config.label}
    </Tag>
  );
}

export default PriorityBadge;
