import { usePengajuanTTE } from "@/hooks/kominfo-submissions";
import { ReloadOutlined, FileTextOutlined } from "@ant-design/icons";
import { Badge, Text } from "@mantine/core";
import { IconCertificate, IconEye } from "@tabler/icons-react";
import { Button, Card, Space, Table, Tooltip } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useRouter } from "next/router";

dayjs.locale("id");

const DaftarPengajuanTTEUser = () => {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = usePengajuanTTE();

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { color: "yellow", label: "DRAFT" },
      PERBAIKAN: { color: "orange", label: "PERBAIKAN" },
      DIAJUKAN: { color: "blue", label: "DIAJUKAN" },
      DISETUJUI: { color: "green", label: "DISETUJUI" },
      DITOLAK: { color: "red", label: "DITOLAK" },
    };

    const config = statusConfig[status] || {
      color: "gray",
      label: status || "UNKNOWN",
    };

    return (
      <Badge color={config.color} size="sm" variant="light">
        {config.label}
      </Badge>
    );
  };

  const columns = [
    {
      title: "NIP",
      dataIndex: "nip",
      key: "nip",
      width: 180,
      render: (nip) => (
        <Text size="sm" fw={500} style={{ fontFamily: "monospace" }}>
          {nip}
        </Text>
      ),
    },
    {
      title: "Email Jatimprov",
      dataIndex: "email_jatimprov",
      key: "email_jatimprov",
      render: (email) => (
        <Text size="xs" c="dimmed" style={{ fontFamily: "monospace" }}>
          {email || "-"}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      align: "center",
      render: (status) => getStatusBadge(status),
    },
    {
      title: "Tanggal Ajuan",
      dataIndex: "tanggal_ajuan",
      key: "tanggal_ajuan",
      width: 160,
      render: (date) =>
        date ? (
          <Tooltip title={dayjs(date).format("DD MMMM YYYY HH:mm:ss")}>
            <div style={{ lineHeight: "1.1", cursor: "pointer" }}>
              <Text size="xs">{dayjs(date).format("DD MMM YYYY")}</Text>
              <div style={{ marginTop: "2px" }}>
                <Text size="10px" c="dimmed">
                  {dayjs(date).format("HH:mm")}
                </Text>
              </div>
            </div>
          </Tooltip>
        ) : (
          <Text size="xs" c="dimmed">
            Belum diajukan
          </Text>
        ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Button
          type="link"
          icon={<IconEye size={16} />}
          onClick={() => router.push(`/kominfo-services/tte/${record.id}`)}
          style={{ padding: "4px 8px" }}
        >
          Detail
        </Button>
      ),
    },
  ];

  return (
    <Card
      style={{
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        border: "none",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#6366f1",
          color: "white",
          padding: "20px",
          borderRadius: "12px 12px 0 0",
          margin: "-24px -24px 0 -24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconCertificate size={24} />
              <Text fw={700} size="lg" style={{ color: "white", margin: 0 }}>
                Daftar Pengajuan TTE
              </Text>
            </div>
            <Text
              size="sm"
              style={{ color: "rgba(255,255,255,0.9)", marginTop: 4 }}
            >
              Riwayat pengajuan Tanda Tangan Elektronik Anda
            </Text>
          </div>
          <Button
            icon={<ReloadOutlined />}
            loading={isLoading || isRefetching}
            onClick={() => refetch()}
            style={{
              background: "rgba(255,255,255,0.2)",
              borderColor: "rgba(255,255,255,0.3)",
              color: "white",
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <div style={{ marginTop: "20px" }}>
        <Table
          columns={columns}
          dataSource={data || []}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 800 }}
          size="middle"
          pagination={false}
          onRow={(record) => ({
            style: { cursor: "pointer" },
            onClick: () => router.push(`/kominfo-services/tte/${record.id}`),
          })}
          locale={{
            emptyText: (
              <div style={{ padding: "60px", textAlign: "center" }}>
                <FileTextOutlined
                  style={{
                    fontSize: 64,
                    color: "#d1d5db",
                    marginBottom: 24,
                  }}
                />
                <div>
                  <Text size="lg" c="dimmed">
                    Belum Ada Pengajuan
                  </Text>
                </div>
                <div style={{ marginTop: "8px" }}>
                  <Text size="sm" c="dimmed">
                    Anda belum memiliki pengajuan TTE
                  </Text>
                </div>
              </div>
            ),
          }}
        />
      </div>
    </Card>
  );
};

export default DaftarPengajuanTTEUser;
