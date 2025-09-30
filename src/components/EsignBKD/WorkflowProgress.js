import { Steps, Avatar, Tooltip, Card } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Text } from "@mantine/core";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const WorkflowProgress = ({ signatureDetails = [], requestType, currentUserId }) => {
  if (!signatureDetails || signatureDetails.length === 0) {
    return null;
  }

  // Sort by sequence order
  const sortedDetails = [...signatureDetails].sort(
    (a, b) => a.sequence_order - b.sequence_order
  );

  // Determine current step
  const currentStepIndex = sortedDetails.findIndex(
    (detail) => detail.status === "waiting" && detail.user_id === currentUserId
  );

  const getStepStatus = (detail, index) => {
    // Completed statuses
    if (["signed", "reviewed", "marked_for_tte"].includes(detail.status)) {
      return "finish";
    }

    // Rejected
    if (detail.status === "rejected") {
      return "error";
    }

    // Current user's turn
    if (detail.user_id === currentUserId && detail.status === "waiting") {
      return "process";
    }

    // Waiting
    return "wait";
  };

  const getStepIcon = (detail, status) => {
    if (status === "finish") {
      return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
    }
    if (status === "error") {
      return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
    }
    if (status === "process") {
      return (
        <Avatar
          size={32}
          src={detail.user?.image}
          style={{
            backgroundColor: "#1890ff",
            border: "3px solid #1890ff",
          }}
        >
          {detail.user?.username?.charAt(0)?.toUpperCase() || "U"}
        </Avatar>
      );
    }
    return (
      <Avatar
        size={32}
        src={detail.user?.image}
        style={{
          backgroundColor: "#d9d9d9",
        }}
      >
        {detail.user?.username?.charAt(0)?.toUpperCase() || "U"}
      </Avatar>
    );
  };

  const getStepDescription = (detail) => {
    const roleLabel = detail.role_type === "reviewer" ? "Reviewer" : "Penandatangan";

    if (detail.status === "signed") {
      return (
        <Text size="xs" style={{ color: "#52c41a" }}>
          {roleLabel} • Ditandatangani {dayjs(detail.signed_at).format("DD/MM/YY HH:mm")}
        </Text>
      );
    }

    if (detail.status === "reviewed") {
      return (
        <Text size="xs" style={{ color: "#52c41a" }}>
          {roleLabel} • Direview {dayjs(detail.reviewed_at).format("DD/MM/YY HH:mm")}
        </Text>
      );
    }

    if (detail.status === "marked_for_tte") {
      return (
        <Text size="xs" style={{ color: "#faad14" }}>
          {roleLabel} • Ditandai untuk TTE
        </Text>
      );
    }

    if (detail.status === "rejected") {
      return (
        <Text size="xs" style={{ color: "#ff4d4f" }}>
          {roleLabel} • Ditolak
        </Text>
      );
    }

    if (detail.user_id === currentUserId && detail.status === "waiting") {
      return (
        <Text size="xs" style={{ color: "#1890ff", fontWeight: 600 }}>
          {roleLabel} • Menunggu aksi Anda
        </Text>
      );
    }

    return (
      <Text size="xs" style={{ color: "#999" }}>
        {roleLabel} • Menunggu
      </Text>
    );
  };

  return (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: 600, color: "#262626" }}>
          Alur Persetujuan
        </Text>
        <Text style={{ fontSize: 12, color: "#8c8c8c", marginLeft: 8 }}>
          {requestType === "sequential" ? "Berurutan" : "Paralel"}
        </Text>
      </div>

      <Steps
        current={currentStepIndex >= 0 ? currentStepIndex : 0}
        labelPlacement="vertical"
        style={{ marginTop: 24 }}
      >
        {sortedDetails.map((detail, index) => {
          const status = getStepStatus(detail, index);
          const isCurrentUser = detail.user_id === currentUserId;

          return (
            <Steps.Step
              key={detail.id}
              status={status}
              title={
                <Tooltip title={detail.user?.nama_jabatan || detail.user?.username}>
                  <div
                    style={{
                      maxWidth: 120,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: isCurrentUser ? 600 : 400,
                        color: isCurrentUser ? "#1890ff" : "#262626",
                      }}
                    >
                      {detail.user?.username || "User"}
                    </Text>
                  </div>
                </Tooltip>
              }
              description={getStepDescription(detail)}
              icon={getStepIcon(detail, status)}
            />
          );
        })}
      </Steps>

      {requestType === "sequential" && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: "#e6f7ff",
            borderRadius: 8,
            border: "1px solid #91d5ff",
          }}
        >
          <Text style={{ fontSize: 12, color: "#0050b3" }}>
            ℹ️ Proses persetujuan berurutan: Setiap langkah harus diselesaikan sebelum
            langkah berikutnya dapat dimulai
          </Text>
        </div>
      )}
    </Card>
  );
};

export default WorkflowProgress;