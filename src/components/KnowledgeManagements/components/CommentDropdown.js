import {
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { Button, Dropdown } from "antd";

const CommentDropdown = ({
  comment,
  currentUser,
  onEdit,
  onDelete,
  isUpdatingComment,
  isDeletingComment,
}) => {
  const isOwner = currentUser?.id === comment?.user?.custom_id;
  
  
  if (!isOwner) return null;

  const items = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: () => !isUpdatingComment && onEdit(comment),
      disabled: isUpdatingComment,
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Hapus',
      onClick: () => !isDeletingComment && onDelete(comment.id),
      disabled: isDeletingComment,
      danger: true,
    },
  ];

  return (
    <Dropdown
      menu={{ items }}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button
        type="text"
        icon={<MoreOutlined />}
        size="small"
        style={{
          color: "#9CA3AF",
          border: "none",
          boxShadow: "none",
          padding: "4px",
          height: "24px",
          width: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
          backgroundColor: "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#6B7280";
          e.currentTarget.style.backgroundColor = "#F3F4F6";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#9CA3AF";
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      />
    </Dropdown>
  );
};

export default CommentDropdown;