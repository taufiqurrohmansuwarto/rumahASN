import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";

const { Text } = Typography;

const CommentCollapseButton = ({
  isCollapsed,
  repliesCount,
  onToggle,
  isMobile = false,
}) => {
  if (repliesCount === 0) return null;

  return (
    <Button
      type="text"
      size="small"
      onClick={onToggle}
      style={{
        color: "#FF4500",
        padding: "2px 6px",
        height: "auto",
        fontSize: isMobile ? "11px" : "12px",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: "4px",
        marginTop: "8px",
        marginBottom: isCollapsed ? "0" : "8px",
        transition: "all 0.2s ease",
        borderRadius: "12px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#fff2f0";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {isCollapsed ? <RightOutlined /> : <DownOutlined />}
      <Text
        style={{
          color: "#FF4500",
          fontSize: isMobile ? "11px" : "12px",
          fontWeight: 500,
        }}
      >
        {isCollapsed 
          ? `Lihat ${repliesCount} balasan` 
          : `Sembunyikan balasan`
        }
      </Text>
    </Button>
  );
};

export default CommentCollapseButton;