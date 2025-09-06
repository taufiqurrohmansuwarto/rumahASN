import {
  EditOutlined,
  ClockCircleOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  BranchesOutlined,
} from "@ant-design/icons";
import { Tag, Tooltip } from "antd";

const RevisionStatusIndicator = ({
  status,
  size = "default", // "small" | "default" | "large"
  showTooltip = true,
  style = {},
}) => {
  const statusConfigs = {
    draft: {
      color: "#faad14",
      icon: <EditOutlined style={{ fontSize: size === "small" ? "10px" : "12px" }} />,
      text: "Draft",
      tooltip: "Revisi sedang dalam tahap editing",
      bgColor: "#fff7e6",
    },
    pending_revision: {
      color: "#1890ff",
      icon: <ClockCircleOutlined style={{ fontSize: size === "small" ? "10px" : "12px" }} />,
      text: "Pending Review", 
      tooltip: "Revisi menunggu review dari admin",
      bgColor: "#e6f4ff",
    },
    approved: {
      color: "#52c41a",
      icon: <CheckCircleOutlined style={{ fontSize: size === "small" ? "10px" : "12px" }} />,
      text: "Approved",
      tooltip: "Revisi telah disetujui dan dipublikasikan",
      bgColor: "#f6ffed",
    },
    rejected: {
      color: "#ff4d4f", 
      icon: <CloseCircleOutlined style={{ fontSize: size === "small" ? "10px" : "12px" }} />,
      text: "Rejected",
      tooltip: "Revisi ditolak oleh admin",
      bgColor: "#fff2f0",
    },
    published: {
      color: "#52c41a",
      icon: <BranchesOutlined style={{ fontSize: size === "small" ? "10px" : "12px" }} />,
      text: "Published",
      tooltip: "Konten saat ini dipublikasikan",
      bgColor: "#f6ffed",
    }
  };

  const config = statusConfigs[status] || statusConfigs.draft;
  
  const fontSize = {
    small: "10px",
    default: "12px", 
    large: "14px"
  }[size];

  const tagStyle = {
    fontSize,
    fontWeight: 500,
    borderRadius: "4px",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    margin: 0,
    padding: size === "small" ? "2px 6px" : "4px 8px",
    ...style
  };

  const tag = (
    <Tag color={config.color} style={tagStyle}>
      {config.icon}
      {config.text}
    </Tag>
  );

  return showTooltip ? (
    <Tooltip title={config.tooltip} placement="top">
      {tag}
    </Tooltip>
  ) : (
    tag
  );
};

export default RevisionStatusIndicator;