import { getFormasiById } from "@/services/perencanaan-formasi.services";
import {
  IconCalendarEvent,
  IconClipboardList,
  IconPaperclip,
  IconUser,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Card, Skeleton, Space, Tabs, Tag, Typography, Grid } from "antd";
import { useRouter } from "next/router";
import LampiranList from "./LampiranList";
import UsulanList from "./UsulanList";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

// Status Badge
const StatusBadge = ({ status }) => {
  const config = {
    aktif: { color: "green", label: "Aktif" },
    nonaktif: { color: "default", label: "Nonaktif" },
  };
  const { color, label } = config[status] || config.nonaktif;
  return <Tag color={color}>{label}</Tag>;
};

// Info Badge Component - compact inline
const InfoBadge = ({ icon: Icon, label, value }) => (
  <Space size={4} style={{ display: 'inline-flex', alignItems: 'center' }}>
    <Icon size={14} color="#868e96" />
    <Text type="secondary" style={{ fontSize: 12 }}>
      {label}:
    </Text>
    <Text strong style={{ fontSize: 12 }}>
      {value || "-"}
    </Text>
  </Space>
);

function FormasiDetail({ formasiId, activeTab = "usulan" }) {
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Fetch formasi detail
  const { data: formasi, isLoading } = useQuery({
    queryKey: ["perencanaan-formasi-detail", formasiId],
    queryFn: () => getFormasiById(formasiId),
    enabled: !!formasiId,
  });

  const handleTabChange = (key) => {
    router.replace(`/perencanaan/formasi/${formasiId}/${key}`);
  };

  const tabItems = [
    {
      key: "usulan",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <IconClipboardList size={16} />
          Formasi
        </span>
      ),
      children: <UsulanList formasiId={formasiId} formasi={formasi} />,
    },
    {
      key: "lampiran",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <IconPaperclip size={16} />
          Lampiran
        </span>
      ),
      children: <LampiranList formasiId={formasiId} formasi={formasi} />,
    },
  ];

  if (isLoading) {
    return (
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Card>
          <Skeleton active paragraph={{ rows: 1 }} />
        </Card>
        <Card>
          <Skeleton active />
        </Card>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      {/* Header - responsive layout */}
      <Card
        bordered={false}
        style={{
          borderRadius: 8,
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
          border: "1px solid #f0f0f0"
        }}
        bodyStyle={{ padding: "16px 24px" }}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          {/* Title + Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconClipboardList size={20} color="#1890ff" />
                <Text strong style={{ fontSize: 16 }}>
                {formasi?.deskripsi || "Detail Formasi"}
                </Text>
            </div>
            <StatusBadge status={formasi?.status} />
          </div>

          {/* Info badges */}
          <Space size={isMobile ? "small" : "large"} wrap style={{ marginTop: 4 }}>
            <InfoBadge
              icon={IconCalendarEvent}
              label="Tahun"
              value={formasi?.tahun}
            />
            <InfoBadge
              icon={IconClipboardList}
              label="Usulan"
              value={formasi?.usulan?.length || 0}
            />
            <InfoBadge
              icon={IconUser}
              label="Dibuat"
              value={formasi?.dibuatOleh?.username}
            />
          </Space>
        </Space>
      </Card>

      {/* Tabs - Outside Card */}
      <Card
        bordered={false}
        style={{
            borderRadius: 8,
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
            border: "1px solid #f0f0f0"
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={tabItems}
            size="middle"
            tabBarStyle={{ padding: "0 24px", margin: 0 }}
        />
      </Card>
    </Space>
  );
}

export default FormasiDetail;
