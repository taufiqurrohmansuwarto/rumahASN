import {
  daftarPemberhentian,
  syncPemberhentianSIASN,
} from "@/services/siasn-services";
import {
  IconTrendingDown,
  IconRefresh,
  IconDownload,
  IconUser,
  IconX,
  IconFilterX,
  IconCalendar,
  IconFileCheck,
  IconBuilding,
  IconUserMinus
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

const FORMAT = "MM-YYYY";

function LayananPemberhentian() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { page = 1, limit = 10 } = router.query;

  const [periode, setPeriode] = useState(() => {
    const today = dayjs();
    const defaultPeriode = today.format(FORMAT);
    return router.query.periode || defaultPeriode;
  });

  const handleChangePeriode = useCallback(
    (value) => {
      const newPeriode = value.format(FORMAT);
      setPeriode(newPeriode);
      router.push({
        pathname: "/layanan-siasn/pemberhentian",
        query: { periode: newPeriode, page: 1 },
      });
    },
    [router]
  );

  const { data, isLoading, isFetching, error, refetch } = useQuery(
    ["daftar-pemberhentian", router?.query],
    () => daftarPemberhentian(router?.query),
    {
      enabled: !!router?.query,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const { mutate: sync, isLoading: isLoadingSync } = useMutation(
    () => syncPemberhentianSIASN(router?.query),
    {
      onSuccess: () => {
        message.success("Data berhasil disinkronisasi");
        queryClient.invalidateQueries(["daftar-pemberhentian"]);
      },
      onError: (error) => message.error(error?.response?.data?.message || "Gagal sinkronisasi"),
    }
  );

  const handleSync = () => sync();

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
    const today = dayjs();
    const defaultPeriode = today.format(FORMAT);
    setPeriode(defaultPeriode);
    router.push({
      pathname: router.pathname,
      query: { ...restQuery, periode: defaultPeriode, page: 1 },
    });
  };

  const columns = [
    {
      title: "Pegawai",
      key: "pegawai_info",
      width: 300,
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
                {record?.nama}
              </Text>
            </div>
            {record?.nipBaru && (
              <div style={{ marginTop: "2px" }}>
                <Text size="xs" c="dimmed" ff="monospace">
                  {record?.nipBaru}
                </Text>
              </div>
            )}
            {record?.instansiNama && (
              <div style={{ marginTop: "3px" }}>
                <Tooltip title={record?.instansiNama} placement="top">
                  <Badge
                    variant="light"
                    color="gray"
                    size="sm"
                    style={{ cursor: "help", maxWidth: "220px" }}
                  >
                    <Text size="xs" truncate span>
                      {record?.instansiNama?.length > 25
                        ? `${record?.instansiNama?.substring(0, 25)}...`
                        : record?.instansiNama}
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
      title: "Jenis Pemberhentian",
      key: "jenis_pemberhentian",
      width: 180,
      render: (_, record) => (
        <Badge
          variant="light"
          size="md"
          color="red"
          leftSection={
            <div style={{ display: "flex", alignItems: "center" }}>
              <IconUserMinus size={14} />
            </div>
          }
          styles={{
            section: { display: "flex", alignItems: "center" },
            label: { display: "flex", alignItems: "center" },
          }}
        >
          {record?.detailLayananNama || "Pemberhentian"}
        </Badge>
      ),
    },
    {
      title: "TMT",
      key: "tmt",
      width: 100,
      render: (_, record) => (
        <Text size="sm" ff="monospace">
          {record?.tmtPensiun || record?.skTgl || "N/A"}
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

        return (
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
        );
      },
    },
    {
      title: "Dokumen",
      key: "dokumen",
      width: 120,
      render: (_, record) => (
        <Space size={4} direction="vertical">
          {record?.pathPertek && (
            <Tooltip title="Unduh file Pertek">
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record.pathPertek}`}
                target="_blank"
                rel="noreferrer"
              >
                <Badge
                  color="orange"
                  size="sm"
                  style={{ cursor: "pointer" }}
                  leftSection={<div style={{ display: "flex", alignItems: "center" }}><IconDownload size={12} /></div>}
                  styles={{
                    section: { display: "flex", alignItems: "center" },
                    label: { display: "flex", alignItems: "center" }
                  }}
                >
                  Unduh Pertek
                </Badge>
              </a>
            </Tooltip>
          )}
          {record?.pathSk && (
            <Tooltip title="Unduh file SK">
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record.pathSk}`}
                target="_blank"
                rel="noreferrer"
              >
                <Badge
                  color="blue"
                  size="sm"
                  style={{ cursor: "pointer" }}
                  leftSection={<div style={{ display: "flex", alignItems: "center" }}><IconDownload size={12} /></div>}
                  styles={{
                    section: { display: "flex", alignItems: "center" },
                    label: { display: "flex", alignItems: "center" }
                  }}
                >
                  Unduh SK
                </Badge>
              </a>
            </Tooltip>
          )}
          {!record?.pathPertek && !record?.pathSk && (
            <Badge
              color="gray"
              size="sm"
              leftSection={<div style={{ display: "flex", alignItems: "center" }}><IconX size={12} /></div>}
              styles={{
                section: { display: "flex", alignItems: "center" },
                label: { display: "flex", alignItems: "center" }
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
            <IconTrendingDown size={24} style={{ marginBottom: "8px" }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Integrasi Pemberhentian
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 14 }}>
              Monitoring dan sinkronisasi data pemberhentian dari SIASN
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
                    <DatePicker.MonthPicker
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
                  {periode !== dayjs().format(FORMAT) && (
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
            {periode !== dayjs().format(FORMAT) && (
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
              dataSource={data}
              loading={isLoading || isFetching}
              size="middle"
              scroll={{ x: 760 }}
              style={{
                borderRadius: "12px",
                overflow: "hidden",
              }}
              pagination={{
                position: ["bottomRight"],
                total: data?.length ?? 0,
                pageSize: parseInt(limit),
                current: parseInt(page),
                showSizeChanger: false,
                onChange: handleChangePage,
                showTotal: (total, range) =>
                  `${range[0].toLocaleString('id-ID')}-${range[1].toLocaleString('id-ID')} dari ${total.toLocaleString('id-ID')} records`,
                style: { margin: "16px 0" },
              }}
              locale={{
                emptyText: (
                  <div style={{ padding: "40px", textAlign: "center" }}>
                    <IconTrendingDown
                      size={48}
                      style={{ color: "#d1d5db", marginBottom: 16 }}
                    />
                    <div>
                      <Text size="md" c="dimmed">
                        Tidak ada data pemberhentian
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

export default LayananPemberhentian;
