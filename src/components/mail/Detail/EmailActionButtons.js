import {
  DeleteOutlined,
  FlagOutlined,
  FolderOutlined,
  MoreOutlined,
  PrinterOutlined,
  RetweetOutlined,
  RollbackOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Space } from "antd";

const EmailActionButtons = ({
  email,
  onReply,
  onReplyAll,
  onForward,
  onDelete,
  onArchive,
  onFlag,
  onPrint,
  loading = {},
}) => {
  if (!email) return null;

  const moreActions = [
    {
      key: "archive",
      label: "Arsipkan",
      icon: <FolderOutlined />,
      onClick: onArchive,
    },
    {
      key: "flag",
      label: "Tandai Penting",
      icon: <FlagOutlined />,
      onClick: onFlag,
    },
    {
      key: "print",
      label: "Cetak",
      icon: <PrinterOutlined />,
      onClick: onPrint,
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      label: "Hapus",
      icon: <DeleteOutlined />,
      onClick: onDelete,
      danger: true,
    },
  ];

  return (
    <div
      style={{
        padding: "16px",
        // borderTop: "1px solid #f0f0f0",
        // backgroundColor: "#fafafa",
        borderRadius: "0 0 6px 6px",
      }}
    >
      <Space size="middle">
        {/* Primary Actions */}
        <Button
          icon={<SendOutlined />}
          onClick={() => onReply?.(false)}
          shape="round"
          type="primary"
          loading={loading.reply}
          size="large"
        >
          Balas
        </Button>

        {/* <Button
          icon={<RetweetOutlined />}
          onClick={() => onReplyAll?.()}
          loading={loading.replyAll}
          shape="round"
          size="large"
        >
          Balas Semua
        </Button> */}

        <Button
          icon={<RollbackOutlined />}
          onClick={onForward}
          loading={loading.forward}
          shape="round"
          size="large"
        >
          Teruskan
        </Button>

        {/* More Actions Dropdown */}
        {/* <Dropdown
          menu={{ items: moreActions }}
          trigger={["click"]}
          placement="topRight"
        >
          <Button icon={<MoreOutlined />} shape="round" size="large">
            Lainnya
          </Button>
        </Dropdown> */}
      </Space>
    </div>
  );
};

export default EmailActionButtons;
