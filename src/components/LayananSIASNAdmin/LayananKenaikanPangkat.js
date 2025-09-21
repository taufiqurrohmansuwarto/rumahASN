import {
  daftarKenaikanPangkat,
  syncKenaikanPangkat,
} from "@/services/siasn-services";
import {
  IconTrendingUp,
  IconRefresh,
  IconDownload,
  IconUser,
  IconX,
  IconFilterX,
  IconTrendingUp as IconPromotion,
  IconCalendar,
  IconFileCheck,
} from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  message,
  Row,
  Space,
  Table,
  Tooltip,
} from "antd";
import { Text, Title, Badge } from "@mantine/core";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";

dayjs.extend(relativeTime);

const FORMAT = "DD-MM-YYYY";

function LayananKenaikanPangkat() {
  const router = useRouter();
  const { page = 1, limit = 10 } = router.query;

  const [periode, setPeriode] = useState(() => {
    const today = dayjs();
    const defaultPeriode = today.startOf("month").format(FORMAT);
    return router.query.periode || defaultPeriode;
  });

  const { data, isLoading, isFetching, error, refetch } = useQuery(
    ["kenaikan-pangkat", periode, page, limit],
    () => daftarKenaikanPangkat({ periode, page, limit }),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const handleChangePeriode = useCallback(
    (value) => {
      const newPeriode = value.startOf("month").format(FORMAT);
      setPeriode(newPeriode);
      router.push({
        pathname: "/layanan-siasn/kenaikan-pangkat",
        query: { periode: newPeriode, page: 1 },
      });
    },
    [router]
  );

  const { mutate: sync, isLoading: isLoadingSync } = useMutation(
    (data) => syncKenaikanPangkat(data),
    {
      onSuccess: () => message.success("Data berhasil disinkronisasi"),
      onError: (error) => message.error(error?.response?.data?.message),
      onSettled: () => refetch(),
    }
  );

  const handleSync = () => sync({ periode });

  const handleChangePage = (page, limit) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        page,
        limit,
      },
    });
  };

  const clearFilter = () => {
    const { periode, ...restQuery } = router.query;
    router.push({
      pathname: router.pathname,
      query: { ...restQuery, page: 1 },
    });
  };

  const columns = [
    {
      title: "Pegawai",
      key: "pegawai_info",
      width: 350,
      render: (_, record) => (
        <Space size="small">
          <Avatar
            src={record?.pegawai?.foto}
            size={40}
            style={{
              border: "2px solid #f0f0f0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
            icon={<IconUser size={16} />}
          />
          <div style={{ lineHeight: "1.2" }}>
            <div>
              <Text fw={600} size="sm">
                {record?.pegawai?.nama_master || record?.nama}
              </Text>
            </div>
            {record?.nipBaru && (
              <div style={{ marginTop: "2px" }}>
                <Text size="xs" c="dimmed" ff="monospace">
                  {record?.nipBaru}
                </Text>
              </div>
            )}
            {record?.pegawai?.opd_master && (
              <div style={{ marginTop: "3px" }}>
                <Tooltip title={record?.pegawai?.opd_master} placement="top">
                  <Badge
                    variant="light"
                    color="gray"
                    size="sm"
                    style={{ cursor: "help", maxWidth: "220px" }}
                  >
                    <Text size="xs" truncate span>
                      {record?.pegawai?.opd_master?.length > 25
                        ? `${record?.pegawai?.opd_master?.substring(0, 25)}...`
                        : record?.pegawai?.opd_master}
                    </Text>
                  </Badge>
                </Tooltip>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Jenis KP",
      key: "jenis_kp",
      width: 130,
      render: (_, record) => (
        <Badge
          variant="light"
          size="md"
          leftSection={
            <div style={{ display: "flex", alignItems: "center" }}>
              <IconPromotion size={14} />
            </div>
          }
          styles={{
            section: { display: "flex", alignItems: "center" },
            label: { display: "flex", alignItems: "center" },
          }}
        >
          {record?.jenis_kp?.replace("Kenaikan Pangkat ", "") || "Unknown"}
        </Badge>
      ),
    },
    {
      title: "TMT",
      key: "tmt",
      width: 100,
      render: (_, record) => (
        <Text size="sm" ff="monospace">
          {record?.tmtKp || "N/A"}
        </Text>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 160,
      render: (_, record) => {
        const isApproved = record?.statusUsulanNama?.includes("TTD");
        const isRejected = record?.statusUsulanNama?.includes("Ditolak");
        const hasRejectionReason = record?.alasan_tolak_tambahan;

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <Badge
              color={isApproved ? "green" : isRejected ? "red" : "orange"}
              variant="light"
              size="md"
              leftSection={
                <div style={{ display: "flex", alignItems: "center" }}>
                  {isApproved ? (
                    <IconFileCheck size={14} />
                  ) : isRejected ? (
                    <IconX size={14} />
                  ) : (
                    <IconCalendar size={14} />
                  )}
                </div>
              }
              styles={{
                section: { display: "flex", alignItems: "center" },
                label: { display: "flex", alignItems: "center" },
              }}
            >
              {record?.statusUsulanNama || "Unknown"}
            </Badge>
            {hasRejectionReason && (
              <Tooltip title={record.alasan_tolak_tambahan} placement="top">
                <div style={{ cursor: "help" }}>
                  <Text size="xs" c="red" fs="italic" truncate style={{ maxWidth: "140px" }}>
                    {record.alasan_tolak_tambahan.length > 20
                      ? `${record.alasan_tolak_tambahan.substring(0, 20)}...`
                      : record.alasan_tolak_tambahan}
                  </Text>
                </div>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Dokumen",
      key: "dokumen",
      width: 100,
      render: (_, record) => (
        <Space size={4} direction="vertical">
          {record?.path_ttd_pertek && (
            <Tooltip title="Unduh file Pertek">
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_ttd_pertek}`}
                target="_blank"
                rel="noreferrer"
              >
                <Badge
                  color="orange"
                  size="sm"
                  style={{ cursor: "pointer" }}
                  leftSection={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <IconDownload size={12} />
                    </div>
                  }
                  styles={{
                    section: { display: "flex", alignItems: "center" },
                    label: { display: "flex", alignItems: "center" },
                  }}
                >
                  Unduh Pertek
                </Badge>
              </a>
            </Tooltip>
          )}
          {record?.path_ttd_sk && (
            <Tooltip title="Unduh file SK">
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_ttd_sk}`}
                target="_blank"
                rel="noreferrer"
              >
                <Badge
                  color="blue"
                  size="sm"
                  style={{ cursor: "pointer" }}
                  leftSection={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <IconDownload size={12} />
                    </div>
                  }
                  styles={{
                    section: { display: "flex", alignItems: "center" },
                    label: { display: "flex", alignItems: "center" },
                  }}
                >
                  Unduh SK
                </Badge>
              </a>
            </Tooltip>
          )}
          {!record?.path_ttd_pertek && !record?.path_ttd_sk && (
            <Badge
              color="gray"
              size="sm"
              leftSection={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <IconX size={12} />
                </div>
              }
              styles={{
                section: { display: "flex", alignItems: "center" },
                label: { display: "flex", alignItems: "center" },
              }}
            >
              Tidak Ada File
            </Badge>
          )}
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          backgroundColor: "#fff2f0",
          borderRadius: "12px",
          border: "1px solid #ffccc7",
        }}
      >
        <Text size="md" c="red">
          ❌ Error: {error.message}
        </Text>
      </div>
    );
  }

  return (
    <div>
      <div style={{ maxWidth: "100%" }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "none",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              background: "#FF4500",
              color: "white",
              padding: "24px",
              textAlign: "center",
              borderRadius: "12px 12px 0 0",
              margin: "-24px -24px 0 -24px",
            }}
          >
            <IconTrendingUp size={24} style={{ marginBottom: "8px" }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Integrasi Kenaikan Pangkat
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 14 }}>
              Monitoring dan sinkronisasi data kenaikan pangkat dari SIASN
            </Text>
          </div>

          {/* Filter and Actions Section */}
          <div
            style={{
              padding: "20px 0 16px 0",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Row gutter={[16, 16]} align="middle" justify="space-between">
              <Col xs={24} lg={16}>
                <Row gutter={[8, 8]} align="middle">
                  <Col xs={24} sm={12} md={6}>
                    <DatePicker
                      picker="month"
                      format={FORMAT}
                      onChange={handleChangePeriode}
                      value={dayjs(periode, FORMAT)}
                      placeholder="Pilih Periode"
                      style={{ width: "100%" }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Button
                      loading={isFetching}
                      onClick={() => refetch()}
                      icon={<IconRefresh size={16} />}
                      style={{
                        borderColor: "#FF4500",
                        color: "#FF4500",
                        borderRadius: "6px",
                        fontWeight: "500",
                        padding: "0 16px",
                        width: "100%",
                      }}
                    >
                      Reload
                    </Button>
                  </Col>
                  {periode !== dayjs().startOf("month").format(FORMAT) && (
                    <Col xs={24} sm={12} md={6}>
                      <Button
                        size="small"
                        onClick={clearFilter}
                        icon={<IconFilterX size={16} />}
                        style={{
                          borderColor: "#FF4500",
                          color: "#FF4500",
                          borderRadius: "6px",
                          fontWeight: "500",
                          padding: "0 16px",
                          width: "100%",
                        }}
                      >
                        Clear Filter
                      </Button>
                    </Col>
                  )}
                </Row>
              </Col>

              <Col xs={24} lg={8}>
                <Row gutter={[8, 8]} justify="end">
                  <Col xs={12} sm={12}>
                    <Tooltip title="Ambil data terbaru dari SIASN">
                      <Button
                        onClick={handleSync}
                        loading={isLoadingSync}
                        type="primary"
                        icon={<IconRefresh size={16} />}
                        style={{
                          backgroundColor: "#FF4500",
                          borderColor: "#FF4500",
                          borderRadius: "6px",
                          fontWeight: "500",
                          width: "100%",
                        }}
                      >
                        Sinkron Data
                      </Button>
                    </Tooltip>
                  </Col>
                  <Col xs={12} sm={12}>
                    <Button
                      icon={<IconDownload size={16} />}
                      style={{
                        borderColor: "#FF4500",
                        color: "#FF4500",
                        borderRadius: "6px",
                        fontWeight: "500",
                        width: "100%",
                      }}
                    >
                      Unduh Data
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>

            {/* Active Filter Tags */}
            {periode !== dayjs().startOf("month").format(FORMAT) && (
              <Row style={{ marginTop: "12px" }}>
                <Col>
                  <Badge variant="light" color="orange" size="sm">
                    📅 {dayjs(periode, FORMAT).locale("id").format("MMMM YYYY")}
                  </Badge>
                </Col>
              </Row>
            )}
          </div>

          {/* Table Section */}
          <div style={{ marginTop: "16px" }}>
            <Table
              columns={columns}
              rowKey={(row) => row?.id}
              dataSource={data?.data}
              loading={isLoading || isFetching}
              size="middle"
              scroll={{ x: 800 }}
              style={{
                borderRadius: "12px",
                overflow: "hidden",
              }}
              pagination={{
                position: ["bottomRight"],
                total: data?.total ?? data?.data?.length ?? 0,
                pageSize: parseInt(limit),
                current: parseInt(page),
                showSizeChanger: false,
                onChange: handleChangePage,
                showTotal: (total, range) =>
                  `${range[0].toLocaleString(
                    "id-ID"
                  )}-${range[1].toLocaleString(
                    "id-ID"
                  )} dari ${total.toLocaleString("id-ID")} records`,
                style: { margin: "16px 0" },
              }}
              locale={{
                emptyText: (
                  <div style={{ padding: "40px", textAlign: "center" }}>
                    <IconTrendingUp
                      size={48}
                      style={{ color: "#d1d5db", marginBottom: 16 }}
                    />
                    <div>
                      <Text size="md" c="dimmed">
                        Tidak ada data kenaikan pangkat
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">
                        Belum ada data untuk periode ini
                      </Text>
                    </div>
                  </div>
                ),
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default LayananKenaikanPangkat;
