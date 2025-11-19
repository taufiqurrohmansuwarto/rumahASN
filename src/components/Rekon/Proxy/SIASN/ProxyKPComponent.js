import { useDownloadProxyExcel } from "@/components/Rekon/Proxy/hooks/useDownloadProxyExcel";
import { getOpdFasilitator } from "@/services/master.services";
import { refStatusUsul } from "@/services/siasn-services";
import { getProxyPangkatList } from "@/services/siasn-proxy.services";
import { Badge, Text } from "@mantine/core";
import {
  IconAlertCircle,
  IconBuilding,
  IconCalendar,
  IconDownload,
  IconEye,
  IconFile,
  IconRefresh,
  IconSearch,
  IconTrendingUp,
  IconUser,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
  TreeSelect,
} from "antd";
import locale from "antd/locale/id_ID";
import dayjs from "dayjs";
import "dayjs/locale/id";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
const ProxyKPComponent = () => {
  const router = useRouter();
  const {
    page = 1,
    limit = 15,
    nip,
    nama,
    periode,
    skpd_id,
    status_usulan,
  } = router.query;
  const [searchValues, setSearchValues] = useState({ nip: "", nama: "" });

  const { data, isLoading, isFetching, refetch, isRefetching } = useQuery({
    queryKey: ["proxy-pangkat", router.query],
    queryFn: () => getProxyPangkatList(router.query),
    enabled: !!router.query,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const { data: unor, isLoading: isLoadingUnor } = useQuery({
    queryKey: ["unor-fasilitator"],
    queryFn: () => getOpdFasilitator(),
    refetchOnWindowFocus: false,
  });

  const { data: statusUsulList, isLoading: isLoadingStatusUsul } = useQuery({
    queryKey: ["status-usul"],
    queryFn: () => refStatusUsul(),
    refetchOnWindowFocus: false,
  });

  const { handleDownload, isDownloading } = useDownloadProxyExcel(
    "pangkat",
    router.query
  );

  const updateQuery = (newParams, resetPage = true) => {
    const updatedQuery = { ...router.query, ...newParams };
    if (resetPage) {
      updatedQuery.page = 1;
    }
    router.push({
      pathname: router.pathname,
      query: updatedQuery,
    });
  };

  const handleSearch = () => {
    updateQuery({
      nip: searchValues.nip || undefined,
      nama: searchValues.nama || undefined,
    });
  };

  const handleClearFilter = () => {
    setSearchValues({ nip: "", nama: "" });
    const { nip, nama, periode, skpd_id, status_usulan, ...rest } =
      router.query;
    router.push({ pathname: router.pathname, query: { ...rest, page: 1 } });
  };

  const handlePeriodeChange = (date) => {
    if (date) {
      const periodeValue = date.format("YYYY-MM");
      updateQuery({ periode: periodeValue });
    } else {
      updateQuery({ periode: undefined });
    }
  };

  const handleSkpdChange = (value) => {
    updateQuery({ skpd_id: value || undefined });
  };

  const handleStatusUsulChange = (value) => {
    // Pastikan string kosong tidak dikirim
    updateQuery({ status_usulan: value && value !== "" ? value : undefined });
  };

  const hasFilters = nip || nama || periode || skpd_id || status_usulan;

  const columns = [
    {
      title: "Pegawai",
      key: "pegawai",
      width: 280,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Avatar
            src={record.pegawai?.foto}
            size={40}
            style={{
              border: "2px solid #f0f0f0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              flexShrink: 0,
            }}
          >
            {!record.pegawai?.foto && <IconUser size={20} />}
          </Avatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text fw={600} size="xs" style={{ marginBottom: 2 }}>
              {record.pegawai?.nama_master || record.nama || "-"}
            </Text>
            <Text size="10px" c="dimmed" style={{ marginBottom: 2 }}>
              {record.pegawai?.nip_master || record.nip || "-"}
            </Text>
            {record.pegawai?.jabatan_master && (
              <Text
                size="10px"
                c="dimmed"
                style={{
                  fontStyle: "italic",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {record.pegawai.jabatan_master}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Pangkat",
      key: "pangkat",
      width: 200,
      render: (_, record) => {
        const golLama = record.usulan_data?.data?.golongan_lama_nama;
        const golBaru = record.usulan_data?.data?.golongan_baru_nama;
        return (
          <div style={{ lineHeight: "1.4" }}>
            <div style={{ marginBottom: 4 }}>
              <Text size="10px" c="dimmed" style={{ display: "block" }}>
                Dari: <strong>{golLama || "-"}</strong>
              </Text>
            </div>
            <Badge
              color="green"
              variant="light"
              size="sm"
              leftSection={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <IconTrendingUp size={12} />
                </div>
              }
              styles={{
                section: { display: "flex", alignItems: "center" },
                label: {
                  display: "flex",
                  alignItems: "center",
                  fontSize: "11px",
                },
              }}
            >
              {golBaru || "-"}
            </Badge>
          </div>
        );
      },
    },
    {
      title: "TMT & Periode",
      key: "tmt_periode",
      width: 140,
      render: (_, record) => {
        const tmt = record.usulan_data?.data?.tmt_golongan_baru;
        const periode = record.periode;
        return (
          <div style={{ lineHeight: "1.6" }}>
            {tmt ? (
              <Tooltip title={dayjs(tmt).format("DD MMMM YYYY")}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    marginBottom: 4,
                    cursor: "pointer",
                  }}
                >
                  <IconCalendar size={12} color="#1890ff" />
                  <Text size="xs" c="blue" fw={500}>
                    {dayjs(tmt).format("DD/MM/YY")}
                  </Text>
                </div>
              </Tooltip>
            ) : (
              <Text size="10px" c="dimmed" style={{ marginBottom: 4 }}>
                TMT: -
              </Text>
            )}
            {periode && (
              <Text size="10px" c="dimmed">
                Periode: <strong>{dayjs(periode).format("MMM YYYY")}</strong>
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Jenis & Unit Kerja",
      key: "jenis_unor",
      ellipsis: true,
      render: (_, record) => {
        const jenis = record.detail_layanan_nama;
        const opd = record.pegawai?.opd_master;
        return (
          <div style={{ lineHeight: "1.4" }}>
            <Text
              size="xs"
              fw={500}
              style={{ marginBottom: 4, display: "block" }}
            >
              {jenis || "-"}
            </Text>
            <Tooltip title={opd}>
              <Badge
                color="gray"
                variant="outline"
                size="sm"
                leftSection={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <IconBuilding size={12} />
                  </div>
                }
                styles={{
                  section: { display: "flex", alignItems: "center" },
                  label: {
                    display: "flex",
                    alignItems: "center",
                    fontSize: "10px",
                  },
                  root: { maxWidth: "100%" },
                }}
              >
                <div
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {opd || "-"}
                </div>
              </Badge>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: "Status & Dokumen",
      key: "status_dokumen",
      width: 200,
      render: (_, record) => {
        const hasPertek = record.path_ttd_pertek;
        const hasSk = record.path_ttd_sk;
        const alasanTolak = record.alasan_tolak_tambahan;
        const status = record.status_usulan_nama;
        const statusId = record.status_usulan;

        // Status badge color mapping
        const getStatusColor = (id) => {
          if (!id) return "default";
          const idNum = parseInt(id);
          if (idNum === 1) return "orange"; // Pengajuan
          if (idNum === 2) return "blue"; // Diproses
          if (idNum === 3) return "green"; // Selesai
          if (idNum === 4) return "red"; // Ditolak
          return "default";
        };

        return (
          <div style={{ lineHeight: "1.4" }}>
            {/* Status */}
            {status && (
              <div style={{ marginBottom: 6 }}>
                <Badge
                  color={getStatusColor(statusId)}
                  variant="light"
                  size="sm"
                  styles={{
                    label: { fontSize: "10px" },
                  }}
                >
                  {status}
                </Badge>
              </div>
            )}

            {/* Dokumen Download */}
            {(hasPertek || hasSk) && (
              <div style={{ marginBottom: 4 }}>
                {hasPertek && (
                  <a
                    href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_ttd_pertek}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "10px",
                      color: "#1890ff",
                      textDecoration: "none",
                      marginBottom: "2px",
                    }}
                  >
                    <IconFile size={12} />
                    <span>Pertek</span>
                  </a>
                )}
                {hasPertek && hasSk && (
                  <span style={{ margin: "0 4px", fontSize: "10px" }}>|</span>
                )}
                {hasSk && (
                  <a
                    href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_ttd_sk}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "10px",
                      color: "#1890ff",
                      textDecoration: "none",
                    }}
                  >
                    <IconFile size={12} />
                    <span>SK</span>
                  </a>
                )}
              </div>
            )}

            {/* Alasan Tolak */}
            {alasanTolak && (
              <Tooltip title={alasanTolak}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "4px",
                  }}
                >
                  <IconAlertCircle
                    size={12}
                    color="#ff4d4f"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <Text
                    size="10px"
                    c="red"
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {alasanTolak}
                  </Text>
                </div>
              </Tooltip>
            )}

            {/* Jika tidak ada status, dokumen dan alasan tolak */}
            {!status && !hasPertek && !hasSk && !alasanTolak && (
              <Text size="10px" c="dimmed">
                -
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 80,
      fixed: "right",
      align: "center",
      render: (_, record) => {
        const nip = record.pegawai?.nip_master || record.nip;
        return (
          <Button
            type="primary"
            size="small"
            icon={<IconEye size={14} />}
            style={{
              fontSize: "11px",
              height: "24px",
              padding: "0 8px",
            }}
            onClick={() => router.push(`/rekon/pegawai/${nip}/detail`)}
          >
            Detail
          </Button>
        );
      },
    },
  ];

  return (
    <Card
      size="small"
      style={{
        borderRadius: "8px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#1890FF",
          padding: "16px",
          borderRadius: "8px 8px 0 0",
          margin: "-16px -16px 16px -16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconTrendingUp size={20} color="white" />
          <Text fw={600} size="md" style={{ color: "white" }}>
            Data Kenaikan Pangkat
          </Text>
        </div>
      </div>

      {/* Filter & Actions */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {/* Filter Row 1 */}
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="NIP"
            prefix={<IconUser size={14} />}
            value={searchValues.nip}
            onChange={(e) =>
              setSearchValues({ ...searchValues, nip: e.target.value })
            }
            onPressEnter={handleSearch}
            size="small"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Nama"
            prefix={<IconSearch size={14} />}
            value={searchValues.nama}
            onChange={(e) =>
              setSearchValues({ ...searchValues, nama: e.target.value })
            }
            onPressEnter={handleSearch}
            size="small"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <DatePicker
            placeholder="Periode"
            picker="month"
            allowClear
            value={periode ? dayjs(periode, "YYYY-MM") : null}
            onChange={handlePeriodeChange}
            style={{ width: "100%" }}
            size="small"
            suffixIcon={<IconCalendar size={14} />}
            format="MMMM YYYY"
            locale={locale}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Space
            size="small"
            style={{ width: "100%", justifyContent: "flex-end" }}
          >
            <Button
              type="primary"
              size="small"
              icon={<IconSearch size={16} />}
              onClick={handleSearch}
            >
              Cari
            </Button>
            {hasFilters && (
              <Button size="small" onClick={handleClearFilter}>
                Clear
              </Button>
            )}
          </Space>
        </Col>

        {/* Filter Row 2 */}
        <Col xs={24} sm={12} md={9}>
          <TreeSelect
            placeholder="Unit Kerja"
            allowClear
            showSearch
            treeDefaultExpandAll={false}
            value={skpd_id || undefined}
            onChange={handleSkpdChange}
            treeData={unor}
            loading={isLoadingUnor}
            style={{ width: "100%" }}
            size="small"
            suffixIcon={<IconBuilding size={14} />}
            filterTreeNode={(input, node) =>
              node.title?.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          />
        </Col>
        <Col xs={24} sm={12} md={9}>
          <Select
            placeholder="Status Usulan"
            allowClear
            showSearch
            value={status_usulan || undefined}
            onChange={handleStatusUsulChange}
            loading={isLoadingStatusUsul}
            style={{ width: "100%" }}
            size="small"
            options={statusUsulList?.map((item) => ({
              label: item.nama,
              value: item.id,
            }))}
            filterOption={(input, option) =>
              option.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          />
        </Col>
        <Col xs={24} md={6}>
          <Space
            size="small"
            style={{ width: "100%", justifyContent: "flex-end" }}
          >
            <Button
              size="small"
              icon={<IconRefresh size={16} />}
              loading={isLoading || isRefetching}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              size="small"
              icon={<IconDownload size={16} />}
              loading={isDownloading}
              onClick={handleDownload}
            >
              Excel
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading || isFetching}
        size="small"
        scroll={{ x: 1220 }}
        pagination={{
          total: data?.pagination?.total || 0,
          pageSize: parseInt(limit),
          current: parseInt(page),
          showSizeChanger: false,
          onChange: (newPage) => updateQuery({ page: newPage }, false),
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total.toLocaleString(
              "id-ID"
            )} data`,
          size: "small",
        }}
        locale={{
          emptyText: (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <IconTrendingUp size={48} color="#d9d9d9" />
              <br />
              <Text c="dimmed" size="sm">
                Belum ada data kenaikan pangkat
              </Text>
            </div>
          ),
        }}
      />
    </Card>
  );
};

export default ProxyKPComponent;
