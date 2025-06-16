import { useRBAC } from "@/context/RBACContext";
import { editTicket } from "@/services/index";
import {
  formatDateFromNow,
  setColorStatus,
  setStatusIcon,
} from "@/utils/client-utils";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Space, Tag, Typography, message, Grid, Flex } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";

const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

const StatusTiket = ({ ticket }) => {
  const screens = useBreakpoint();

  // Memoize responsive config
  const responsiveConfig = useMemo(() => {
    const isMobile = !screens.md;

    return {
      isMobile,
      fontSize: isMobile ? 11 : 12,
      tagSize: isMobile ? "small" : "default",
    };
  }, [screens.md]);

  return (
    <Flex
      align="center"
      gap={8}
      wrap="wrap"
      style={{
        marginTop: 8,
      }}
    >
      <Tag
        icon={setStatusIcon(ticket?.status_code)}
        color={setColorStatus(ticket?.status_code)}
        size={responsiveConfig.tagSize}
        style={{
          fontWeight: 500,
          borderRadius: 4,
        }}
      >
        {ticket?.status_code}
      </Tag>
      <Text
        style={{
          fontSize: responsiveConfig.fontSize,
          color: "#8c8c8c",
          lineHeight: 1.4,
        }}
        type="secondary"
      >
        📝 oleh{" "}
        <Link href={`/users/${ticket?.customer?.custom_id}`}>
          <Typography.Link
            style={{
              fontWeight: 500,
              fontSize: responsiveConfig.fontSize,
            }}
          >
            {ticket?.customer?.username}
          </Typography.Link>
        </Link>{" "}
        • ⏰ {formatDateFromNow(ticket?.created_at)} • 💬 {ticket?.data?.length}{" "}
        komentar
      </Text>
    </Flex>
  );
};

const BackIcon = () => {
  const router = useRouter();
  const screens = useBreakpoint();

  const iconSize = !screens.md ? 16 : 18;

  return (
    <ArrowLeftOutlined
      onClick={() => router.back()}
      style={{
        cursor: "pointer",
        fontSize: iconSize,
        marginRight: 8,
        color: "#1890ff",
        padding: 4,
        borderRadius: 4,
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#f0f9ff";
        e.currentTarget.style.color = "#0050b3";
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#1890ff";
        e.currentTarget.style.transform = "scale(1)";
      }}
    />
  );
};

function ChangeTicketTitle({ name, attributes, ticket }) {
  const { canAccess } = useRBAC();
  const screens = useBreakpoint();
  const queryClient = useQueryClient();

  // Memoize responsive config
  const responsiveConfig = useMemo(() => {
    const isMobile = !screens.md;

    return {
      isMobile,
      titleLevel: isMobile ? 5 : 4,
      padding: isMobile ? 12 : 16,
    };
  }, [screens.md]);

  const { mutate, isLoading } = useMutation((data) => editTicket(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", ticket?.id]);
      message.success("✅ Berhasil mengubah judul tiket");
    },
    onError: () => message.error("❌ Gagal mengubah judul tiket"),
  });

  const handleEditTitle = (value) => {
    const data = {
      id: ticket?.id,
      data: {
        title: value,
        content: null,
      },
    };

    if (value) {
      mutate(data);
    }
  };

  const containerStyle = {
    backgroundColor: "white",
    padding: responsiveConfig.padding,
    borderRadius: 8,
  };

  if (!canAccess(name, attributes)) {
    return (
      <div style={containerStyle}>
        <Flex align="flex-start" gap={8} style={{ marginBottom: 4 }}>
          <BackIcon />
          <Title
            level={responsiveConfig.titleLevel}
            style={{
              margin: 0,
              lineHeight: 1.3,
              color: "#262626",
              wordBreak: "break-word",
            }}
          >
            {ticket?.title}
          </Title>
        </Flex>
        <StatusTiket ticket={ticket} />
      </div>
    );
  } else {
    return (
      <div style={containerStyle}>
        <Flex align="flex-start" gap={8} style={{ marginBottom: 4 }}>
          <BackIcon />
          <Title
            level={responsiveConfig.titleLevel}
            editable={{
              onChange: handleEditTitle,
              tooltip: "Klik untuk mengedit judul",
            }}
            style={{
              margin: 0,
              lineHeight: 1.3,
              color: "#262626",
              wordBreak: "break-word",
              flex: 1,
            }}
          >
            {ticket?.title}
          </Title>
        </Flex>
        <StatusTiket ticket={ticket} />
      </div>
    );
  }
}

export default ChangeTicketTitle;
