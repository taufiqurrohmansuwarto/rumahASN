import React, { useState } from "react";
import { Typography, Space, Avatar, Button, Tag } from "antd";
import {
  UserOutlined,
  DownOutlined,
  UpOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";

const { Text } = Typography;

// Komponen untuk menampilkan satu penerima
const RecipientTag = ({ recipient }) => {
  return (
    <Tag style={{ padding: "0px 4px" }}>
      <Space size="small">
        <Avatar
          src={recipient.user?.image}
          icon={<UserOutlined />}
          size="small"
        />
        <span>
          {recipient.user?.username || recipient.recipient_name || "Unknown"}
        </span>
        {recipient.user?.email && (
          <Text type="secondary" style={{ fontSize: "11px" }}>
            ({recipient.user.email})
          </Text>
        )}
      </Space>
    </Tag>
  );
};

// Komponen untuk menampilkan daftar penerima berdasarkan tipe
const RecipientList = ({ recipientList, label, icon }) => {
  if (!recipientList || recipientList.length === 0) return null;

  return (
    <div style={{ marginBottom: "12px" }}>
      <Text
        strong
        style={{
          marginRight: "8px",
          minWidth: "40px",
          display: "inline-block",
        }}
      >
        {icon && icon} {label}:
      </Text>
      <Space wrap size="small">
        {recipientList.map((recipient, index) => (
          <RecipientTag key={index} recipient={recipient} />
        ))}
      </Space>
    </div>
  );
};

// Komponen untuk ringkasan penerima
const RecipientSummary = ({
  to,
  cc,
  bcc,
  showDetails,
  onToggleDetails,
  currentUser,
}) => {
  const getRecipientSummary = () => {
    const toNames = to.slice(0, 2).map((r) => {
      // Jika penerima adalah currentUser, tampilkan "saya"
      if (r.user?.custom_id === currentUser?.id) {
        return "saya";
      }
      return r.user?.username || r.recipient_name || "Unknown";
    });
    const moreCount = to.length - 2;

    if (moreCount > 0) {
      return `kepada ${toNames.join(", ")} dan ${moreCount} lainnya`;
    }

    return `kepada ${toNames.join(", ")}`;
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text type="secondary">
        {getRecipientSummary()}
        {(cc.length > 0 || bcc.length > 0) && (
          <span style={{ marginLeft: "8px" }}>
            {cc.length > 0 && <Tag size="small">CC: {cc.length}</Tag>}
            {bcc.length > 0 && <Tag size="small">BCC: {bcc.length}</Tag>}
          </span>
        )}
      </Text>

      <Button
        type="text"
        size="small"
        icon={showDetails ? <UpOutlined /> : <DownOutlined />}
        onClick={onToggleDetails}
      >
        {showDetails ? "Sembunyikan" : "Detail"}
      </Button>
    </div>
  );
};

// Komponen untuk detail penerima
const RecipientDetails = ({ to, cc, bcc }) => {
  return (
    <div
      style={{
        marginTop: "16px",
        paddingTop: "16px",
        borderTop: "1px solid #f0f0f0",
      }}
    >
      <RecipientList recipientList={to} label="Kepada" icon={null} />
      <RecipientList recipientList={cc} label="CC" icon={null} />
      <RecipientList
        recipientList={bcc}
        label="BCC"
        icon={<EyeInvisibleOutlined />}
      />
    </div>
  );
};

// Komponen utama untuk menampilkan penerima email
const EmailRecipientsDisplay = ({ recipients = [] }) => {
  const {
    data: { user },
  } = useSession();

  const [showDetails, setShowDetails] = useState(false);

  if (!recipients || recipients.length === 0) {
    return null;
  }

  // Kelompokkan penerima berdasarkan tipe
  const { to = [], cc = [], bcc = [] } = recipients;

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div
      style={{
        marginBottom: "16px",
        padding: "12px",
        backgroundColor: "#fafafa",
        borderRadius: "6px",
        border: "1px solid #f0f0f0",
      }}
    >
      {/* Tampilan Ringkasan */}
      <RecipientSummary
        currentUser={user}
        to={to}
        cc={cc}
        bcc={bcc}
        showDetails={showDetails}
        onToggleDetails={handleToggleDetails}
      />

      {/* Tampilan Detail */}
      {showDetails && <RecipientDetails to={to} cc={cc} bcc={bcc} />}
    </div>
  );
};

export default EmailRecipientsDisplay;
