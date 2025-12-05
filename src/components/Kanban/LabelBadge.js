import { Tag } from "antd";

function LabelBadge({ label }) {
  return (
    <Tag
      style={{
        margin: 0,
        fontSize: 10,
        lineHeight: "16px",
        padding: "0 6px",
        borderRadius: 4,
        backgroundColor: `${label.color}15`,
        color: label.color,
        border: `1px solid ${label.color}40`,
      }}
    >
      {label.name}
    </Tag>
  );
}

export default LabelBadge;
