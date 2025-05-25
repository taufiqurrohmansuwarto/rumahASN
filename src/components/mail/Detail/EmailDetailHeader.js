import {
  ClockCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  FlagFilled,
  FlagOutlined,
  FolderOutlined,
  InboxOutlined,
  MailOutlined,
  StarFilled,
  StarOutlined,
  TagOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Dropdown,
  Menu,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";

const { Title, Text } = Typography;

// Komponen untuk menampilkan prioritas email
const EmailPriority = ({ priority }) => {
  if (!priority || priority === "normal") return null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "red";
      case "low":
        return "blue";
      default:
        return "default";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <FlagOutlined />;
      case "low":
        return <FlagOutlined />;
      default:
        return null;
    }
  };

  return (
    <Tag
      color={getPriorityColor(priority)}
      icon={getPriorityIcon(priority)}
      style={{ marginTop: "8px" }}
    >
      Prioritas {priority === "high" ? "Tinggi" : "Rendah"}
    </Tag>
  );
};

// Komponen untuk tombol bintang
const StarButton = ({ isStarred, onToggleStar, isLoading }) => {
  return (
    <Tooltip title={isStarred ? "Hapus bintang" : "Beri bintang"}>
      <Button
        type="text"
        size="small"
        icon={
          isStarred ? (
            <StarFilled style={{ color: "#faad14", fontSize: "20px" }} />
          ) : (
            <StarOutlined style={{ fontSize: "20px" }} />
          )
        }
        onClick={onToggleStar}
        loading={isLoading}
        style={{ padding: "8px" }}
      />
    </Tooltip>
  );
};

// Komponen untuk mark as read/unread
const ReadStatusButton = ({ onToggleUnread, isUnreadLoading }) => {
  return (
    <Tooltip title="Tandai belum dibaca">
      <Button
        type="text"
        size="small"
        icon={<MailOutlined style={{ fontSize: "20px" }} />}
        onClick={onToggleUnread}
        loading={isUnreadLoading}
        style={{ padding: "8px" }}
      />
    </Tooltip>
  );
};

// Komponen untuk move to folder
const MoveToFolderButton = ({ onMoveToFolder, isLoading }) => {
  const folderOptions = [
    { key: "inbox", label: "Kotak Masuk", icon: <InboxOutlined /> },
    { key: "archive", label: "Arsip", icon: <FolderOutlined /> },
    { key: "spam", label: "Spam", icon: <ExclamationCircleOutlined /> },
    { key: "trash", label: "Sampah", icon: <DeleteOutlined /> },
  ];

  const handleMenuClick = ({ key }) => {
    onMoveToFolder(key);
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      {folderOptions.map((folder) => (
        <Menu.Item key={folder.key} icon={folder.icon}>
          {folder.label}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={["click"]}>
      <Tooltip title="Pindah ke folder">
        <Button
          type="text"
          size="small"
          icon={<FolderOutlined style={{ fontSize: "20px" }} />}
          loading={isLoading}
          style={{ padding: "8px" }}
        />
      </Tooltip>
    </Dropdown>
  );
};

// Komponen untuk add label
const AddLabelButton = ({ labels = [], onAddLabel, isLoading }) => {
  const labelOptions = [
    { key: "important", label: "Penting", color: "red" },
    { key: "work", label: "Pekerjaan", color: "blue" },
    { key: "personal", label: "Pribadi", color: "green" },
    { key: "urgent", label: "Mendesak", color: "orange" },
    { key: "follow-up", label: "Tindak Lanjut", color: "purple" },
  ];

  const handleMenuClick = ({ key }) => {
    onAddLabel(key);
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      {labelOptions.map((label) => (
        <Menu.Item key={label.key}>
          <Tag color={label.color}>{label.label}</Tag>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={["click"]}>
      <Tooltip title="Tambah label">
        <Button
          type="text"
          size="small"
          icon={<TagOutlined style={{ fontSize: "20px" }} />}
          loading={isLoading}
          style={{ padding: "8px" }}
        />
      </Tooltip>
    </Dropdown>
  );
};

// Komponen untuk flag priority
const FlagPriorityButton = ({ priority, onChangePriority, isLoading }) => {
  const priorityOptions = [
    {
      key: "high",
      label: "Prioritas Tinggi",
      color: "red",
      icon: <FlagFilled />,
    },
    {
      key: "normal",
      label: "Prioritas Normal",
      color: "default",
      icon: <FlagOutlined />,
    },
    {
      key: "low",
      label: "Prioritas Rendah",
      color: "blue",
      icon: <FlagOutlined />,
    },
  ];

  const handleMenuClick = ({ key }) => {
    onChangePriority(key);
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      {priorityOptions.map((option) => (
        <Menu.Item key={option.key} icon={option.icon}>
          <Tag color={option.color}>{option.label}</Tag>
        </Menu.Item>
      ))}
    </Menu>
  );

  const getCurrentPriorityIcon = () => {
    switch (priority) {
      case "high":
        return <FlagFilled style={{ fontSize: "20px", color: "#ff4d4f" }} />;
      case "low":
        return <FlagOutlined style={{ fontSize: "20px", color: "#1890ff" }} />;
      default:
        return <FlagOutlined style={{ fontSize: "20px" }} />;
    }
  };

  return (
    <Dropdown overlay={menu} trigger={["click"]}>
      <Tooltip title="Ubah prioritas">
        <Button
          type="text"
          size="small"
          icon={getCurrentPriorityIcon()}
          loading={isLoading}
          style={{ padding: "8px" }}
        />
      </Tooltip>
    </Dropdown>
  );
};

// Komponen untuk subjek email
const EmailSubject = ({ subject, priority }) => {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ marginBottom: "4px" }}>
        <Text type="secondary" style={{ fontSize: "12px", fontWeight: "500" }}>
          Subjek:
        </Text>
      </div>
      <Title
        level={4}
        style={{
          margin: 0,
          wordBreak: "break-word",
          lineHeight: "1.3",
        }}
      >
        {subject || "(Tanpa Subjek)"}
      </Title>
      <EmailPriority priority={priority} />
    </div>
  );
};

// Komponen untuk informasi pengirim
const SenderInfo = ({ sender, senderName }) => {
  return (
    <div>
      <div style={{ marginBottom: "8px" }}>
        <Text type="secondary" style={{ fontSize: "12px", fontWeight: "500" }}>
          Dari:
        </Text>
      </div>
      <Space size="small">
        <Avatar src={sender?.image} icon={<UserOutlined />} />
        <div>
          <Text strong>{sender?.username || senderName}</Text>
          {sender?.email && (
            <Text
              type="secondary"
              style={{ fontSize: "12px", marginLeft: "4px" }}
            >
              &lt;{sender.email}&gt;
            </Text>
          )}
        </div>
      </Space>
    </div>
  );
};

// Komponen untuk tanggal email
const EmailDate = ({ createdAt }) => {
  return (
    <Space>
      <ClockCircleOutlined style={{ color: "#8c8c8c" }} />
      <Tooltip title={dayjs(createdAt).format("DD MMMM YYYY, HH:mm:ss")}>
        <Text type="secondary">{dayjs(createdAt).fromNow()}</Text>
      </Tooltip>
    </Space>
  );
};

// Komponen utama header email
const EmailDetailHeader = ({
  email,
  onToggleStar,
  isStarLoading = false,
  onToggleRead,
  isReadLoading = false,
  onToggleUnread,
  isUnreadLoading = false,
}) => {
  if (!email) return null;

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* Subject and Priority */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px",
        }}
      >
        <EmailSubject subject={email.subject} priority={email.priority} />
        <Space>
          <StarButton
            isStarred={email.is_starred}
            onToggleStar={onToggleStar}
            isLoading={isStarLoading}
          />
          <MoveToFolderButton onMoveToFolder={null} isLoading={false} />
          <ReadStatusButton
            onToggleUnread={onToggleUnread}
            isUnreadLoading={isUnreadLoading}
          />
          <AddLabelButton
            labels={email.labels}
            onAddLabel={null}
            isLoading={false}
          />
          <FlagPriorityButton
            priority={email.priority}
            onChangePriority={null}
            isLoading={false}
          />
        </Space>
      </div>

      {/* Sender Info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <SenderInfo sender={email.sender} senderName={email.sender_name} />
        <EmailDate createdAt={email.created_at} />
      </div>
    </div>
  );
};

export default EmailDetailHeader;
