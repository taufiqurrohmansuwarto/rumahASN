import {
  getPengadaanProxy,
  refStatusUsul,
  syncPengadaanProxy,
} from "@/services/siasn-services";
import {
  IconUsers,
  IconRefresh,
  IconDownload,
  IconUser,
  IconX,
  IconFilterX,
  IconCalendar,
  IconFileCheck,
  IconAward
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  message,
  Modal,
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
import { useCallback, useState, useEffect } from "react";

dayjs.extend(relativeTime);

const FORMAT = "YYYY";

function LayananPengadaan() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { page = 1, limit = 10 } = router.query;

  const [tahun, setTahun] = useState(() => {
    const today = dayjs();
    const defaultTahun = today.format(FORMAT);
    return router.query.tahun || defaultTahun;
  });

  const [filters, setFilters] = useState({
    nama: router?.query?.nama || "",
    nip: router?.query?.nip || "",
    no_peserta: router?.query?.no_peserta || "",
  });

  const handleChangeTahun = useCallback(
    (value) => {
      const newTahun = value.format(FORMAT);
      setTahun(newTahun);
      router.push({
        pathname: "/layanan-siasn/pengadaan",
        query: { tahun: newTahun, page: 1 },
      });
    },
    [router]
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Debounced filter effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const query = {
        tahun,
        page: 1,
        ...filters,
      };

      // Remove empty filters
      Object.keys(query).forEach(key => {
        if (!query[key]) delete query[key];
      });

      // Only update if filters have changed from current query
      const hasChanges = Object.keys(filters).some(key =>
        filters[key] !== (router.query[key] || '')
      );

      if (hasChanges) {
        router.push({
          pathname: "/layanan-siasn/pengadaan",
          query,
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters, tahun, router]);

  const clearAllFilters = () => {
    setFilters({ nama: "", nip: "", no_peserta: "" });
    const today = dayjs();
    const defaultTahun = today.format(FORMAT);
    setTahun(defaultTahun);
    router.push({
      pathname: "/layanan-siasn/pengadaan",
      query: { tahun: defaultTahun, page: 1 },
    });
  };

  const { data, isLoading, isFetching, error, refetch } = useQuery(
    ["daftar-pengadaan", router?.query],
    () => getPengadaanProxy(router?.query),
    {
      enabled: !!router?.query,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const { mutate: sync, isLoading: isLoadingSync } = useMutation(
    () => syncPengadaanProxy(router?.query),
    {
      onSuccess: () => {
        message.success("Data berhasil disinkronisasi");
        queryClient.invalidateQueries(["daftar-pengadaan"]);
      },
      onError: (error) => message.error(error?.response?.data?.message || "Gagal sinkronisasi"),
    }
  );

  const handleSync = () => {
    Modal.confirm({
      title: "Sinkronisasi Data Pengadaan ASN",
      content: "Apakah Anda yakin ingin melakukan sinkronisasi data dari SIASN? Proses ini akan memperbarui data terbaru.",
      okText: "Ya, Sinkron",
      cancelText: "Batal",
      icon: <IconRefresh style={{ color: "#FF4500" }} />,
      onOk: () => sync(),
    });
  };

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



  const columns = [
    {
      title: "Pegawai",
      key: "pegawai_info",
      width: 280,
      render: (_, record) => (
        <Space size="small">
          <Avatar
            src={record?.foto}
            size={36}
            style={{
              border: "2px solid #f0f0f0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
            icon={<IconUser size={14} />}
          />
          <div style={{ lineHeight: "1.1" }}>
            <div>
              <Text fw={600} size="xs">
                {record?.usulan_data?.data?.nama}
              </Text>
            </div>
            {record?.nip && (
              <div style={{ marginTop: "1px" }}>
                <Text size="10px" c="dimmed" ff="monospace">
                  {record?.nip}
                </Text>
              </div>
            )}
            {record?.usulan_data?.data?.no_peserta && (
              <div style={{ marginTop: "2px" }}>
                <Tooltip title={`No. Peserta: ${record?.usulan_data?.data?.no_peserta}`} placement="top">
                  <Badge
                    variant="light"
                    color="blue"
                    size="xs"
                    style={{ cursor: "help", maxWidth: "180px" }}
                  >
                    <Text size="10px" truncate span>
                      No: {record?.usulan_data?.data?.no_peserta}
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
      title: "Formasi & Jabatan",
      key: "formasi_jabatan",
      width: 200,
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Badge
            variant="light"
            size="sm"
            color="purple"
            leftSection={
              <div style={{ display: "flex", alignItems: "center" }}>
                <IconAward size={12} />
              </div>
            }
            styles={{
              section: { display: "flex", alignItems: "center" },
              label: { display: "flex", alignItems: "center" },
            }}
          >
            {record?.jenis_formasi_nama || "ASN"}
          </Badge>

          {record?.usulan_data?.data?.jabatan_fungsional_nama && (
            <div>
              <Text size="10px" c="dimmed" truncate>
                {record?.usulan_data?.data?.jabatan_fungsional_nama}
              </Text>
            </div>
          )}

          {record?.usulan_data?.data?.tmt_cpns && (
            <div>
              <Text size="10px" c="dimmed" ff="monospace">
                TMT: {record?.usulan_data?.data?.tmt_cpns}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 140,
      render: (_, record) => {
        const isApproved = record?.status_usulan_nama?.includes("TTD");
        const isRejected = record?.status_usulan_nama?.includes("Ditolak");
        const hasRejectionReason = record?.alasan_tolak_tambahan;

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <Badge
              color={isApproved ? "green" : isRejected ? "red" : "orange"}
              variant="light"
              size="sm"
              leftSection={
                <div style={{ display: "flex", alignItems: "center" }}>
                  {isApproved ? (
                    <IconFileCheck size={12} />
                  ) : isRejected ? (
                    <IconX size={12} />
                  ) : (
                    <IconCalendar size={12} />
                  )}
                </div>
              }
              styles={{
                section: { display: "flex", alignItems: "center" },
                label: { display: "flex", alignItems: "center" },
              }}
            >
              {record?.status_usulan_nama || "Unknown"}
            </Badge>
            {isRejected && hasRejectionReason && (
              <Tooltip title={record.alasan_tolak_tambahan} placement="top">
                <div style={{ cursor: "help" }}>
                  <Text size="10px" c="red" fs="italic" truncate style={{ maxWidth: "120px" }}>
                    {record.alasan_tolak_tambahan.length > 15
                      ? `${record.alasan_tolak_tambahan.substring(0, 15)}...`
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
      width: 130,
      render: (_, record) => (
        <Space size={3} direction="vertical">
          {record?.path_ttd_pertek && (
            <Tooltip title="Unduh file Pertek">
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_ttd_pertek}`}
                target="_blank"
                rel="noreferrer"
              >
                <Badge
                  color="orange"
                  size="xs"
                  style={{ cursor: "pointer" }}
                  leftSection={<div style={{ display: "flex", alignItems: "center" }}><IconDownload size={10} /></div>}
                  styles={{
                    section: { display: "flex", alignItems: "center" },
                    label: { display: "flex", alignItems: "center" }
                  }}
                >
                  Pertek
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
                  size="xs"
                  style={{ cursor: "pointer" }}
                  leftSection={<div style={{ display: "flex", alignItems: "center" }}><IconDownload size={10} /></div>}
                  styles={{
                    section: { display: "flex", alignItems: "center" },
                    label: { display: "flex", alignItems: "center" }
                  }}
                >
                  SK
                </Badge>
              </a>
            </Tooltip>
          )}
          {!record?.path_ttd_pertek && !record?.path_ttd_sk && (
            <Badge
              color="gray"
              size="xs"
              leftSection={<div style={{ display: "flex", alignItems: "center" }}><IconX size={10} /></div>}
              styles={{
                section: { display: "flex", alignItems: "center" },
                label: { display: "flex", alignItems: "center" }
              }}
            >
              No File
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
              padding: "20px",
              textAlign: "center",
              borderRadius: "12px 12px 0 0",
              margin: "-24px -24px 0 -24px",
            }}
          >
            <IconUsers size={24} style={{ marginBottom: "8px" }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Integrasi Pengadaan ASN
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 14 }}>
              Monitoring dan sinkronisasi data pengadaan ASN dari SIASN
            </Text>
          </div>

          {/* Filter and Actions Section */}
          <div
            style={{
              padding: "16px 0 12px 0",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            {/* Search Filters */}
            <Row gutter={[12, 12]} style={{ marginBottom: "16px" }}>
              <Col xs={24}>
                <Text size="sm" fw={600} c="dimmed" style={{ marginBottom: "8px" }}>
                  🔍 Filter Pencarian
                </Text>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <DatePicker
                  picker="year"
                  format={FORMAT}
                  onChange={handleChangeTahun}
                  value={dayjs(tahun, FORMAT)}
                  placeholder="Pilih Tahun"
                  style={{ width: "100%" }}
                  size="middle"
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Input
                  placeholder="Cari berdasarkan nama..."
                  value={filters.nama}
                  onChange={(e) => handleFilterChange("nama", e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                  }}
                  size="middle"
                  allowClear
                  prefix={<IconUser size={16} style={{ color: "#999" }} />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Input
                  placeholder="Cari berdasarkan NIP..."
                  value={filters.nip}
                  onChange={(e) => handleFilterChange("nip", e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                  }}
                  size="middle"
                  allowClear
                  prefix={<Text ff="monospace" size="xs" c="dimmed">NIP</Text>}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Input
                  placeholder="Cari berdasarkan no. peserta..."
                  value={filters.no_peserta}
                  onChange={(e) => handleFilterChange("no_peserta", e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                  }}
                  size="middle"
                  allowClear
                  prefix={<Text size="xs" c="dimmed">#</Text>}
                />
              </Col>
            </Row>

            {/* Action Buttons */}
            <Row gutter={[12, 12]} align="middle" justify="space-between">
              <Col xs={24} sm={12} md={8}>
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <Button
                      loading={isFetching}
                      onClick={() => refetch()}
                      icon={<IconRefresh size={16} />}
                      style={{
                        borderColor: "#FF4500",
                        color: "#FF4500",
                        borderRadius: "8px",
                        fontWeight: "500",
                        width: "100%",
                      }}
                      size="middle"
                    >
                      Reload
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      onClick={clearAllFilters}
                      icon={<IconFilterX size={16} />}
                      style={{
                        borderColor: "#FF4500",
                        color: "#FF4500",
                        borderRadius: "8px",
                        fontWeight: "500",
                        width: "100%",
                      }}
                      size="middle"
                    >
                      Clear Filter
                    </Button>
                  </Col>
                </Row>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Row gutter={[8, 8]} justify="end">
                  <Col span={12}>
                    <Tooltip title="Ambil data terbaru dari SIASN">
                      <Button
                        onClick={handleSync}
                        loading={isLoadingSync}
                        type="primary"
                        icon={<IconRefresh size={16} />}
                        style={{
                          backgroundColor: "#FF4500",
                          borderColor: "#FF4500",
                          borderRadius: "8px",
                          fontWeight: "500",
                          width: "100%",
                        }}
                        size="middle"
                      >
                        Sinkron Data
                      </Button>
                    </Tooltip>
                  </Col>
                  <Col span={12}>
                    <Button
                      icon={<IconDownload size={16} />}
                      style={{
                        borderColor: "#FF4500",
                        color: "#FF4500",
                        borderRadius: "8px",
                        fontWeight: "500",
                        width: "100%",
                      }}
                      size="middle"
                    >
                      Unduh Data
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>

            {/* Active Filter Tags */}
            {(tahun !== dayjs().format(FORMAT) || filters.nama || filters.nip || filters.no_peserta) && (
              <Row style={{ marginTop: "12px" }}>
                <Col>
                  <Space size="small" wrap>
                    {tahun !== dayjs().format(FORMAT) && (
                      <Badge variant="light" color="orange" size="sm">
                        📅 {tahun}
                      </Badge>
                    )}
                    {filters.nama && (
                      <Badge variant="light" color="blue" size="sm">
                        👤 {filters.nama}
                      </Badge>
                    )}
                    {filters.nip && (
                      <Badge variant="light" color="green" size="sm">
                        🆔 {filters.nip}
                      </Badge>
                    )}
                    {filters.no_peserta && (
                      <Badge variant="light" color="purple" size="sm">
                        📋 {filters.no_peserta}
                      </Badge>
                    )}
                  </Space>
                </Col>
              </Row>
            )}
          </div>

          {/* Table Section */}
          <div style={{ marginTop: "12px" }}>
            <Table
              columns={columns}
              rowKey={(row) => row?.id}
              dataSource={data?.data}
              loading={isLoading || isFetching}
              size="middle"
              scroll={{ x: 750 }}
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
                  `${range[0].toLocaleString('id-ID')}-${range[1].toLocaleString('id-ID')} dari ${total.toLocaleString('id-ID')} records`,
                style: { margin: "12px 0" },
              }}
              locale={{
                emptyText: (
                  <div style={{ padding: "40px", textAlign: "center" }}>
                    <IconUsers
                      size={48}
                      style={{ color: "#d1d5db", marginBottom: 16 }}
                    />
                    <div>
                      <Text size="md" c="dimmed">
                        Tidak ada data pengadaan
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">
                        Belum ada data untuk tahun ini
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

export default LayananPengadaan;
