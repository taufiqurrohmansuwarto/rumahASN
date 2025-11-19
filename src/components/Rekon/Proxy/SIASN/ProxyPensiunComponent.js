import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Table,
  Space,
  Tooltip,
  Avatar,
  DatePicker,
  TreeSelect,
  Select,
} from "antd";
import locale from "antd/locale/id_ID";
import { Text, Badge } from "@mantine/core";
import {
  IconRefresh,
  IconDownload,
  IconSearch,
  IconUserOff,
  IconCalendar,
  IconBuilding,
  IconUser,
  IconFile,
  IconAlertCircle,
  IconEye,
  IconTrendingUp,
} from "@tabler/icons-react";
import { getProxyPensiunList } from "@/services/siasn-proxy.services";
import { getOpdFasilitator } from "@/services/master.services";
import { refStatusUsul } from "@/services/siasn-services";
import { useDownloadProxyExcel } from "@/components/Rekon/Proxy/hooks/useDownloadProxyExcel";
import dayjs from "dayjs";
import "dayjs/locale/id";

const ProxyPensiunComponent = () => {
  const router = useRouter();
  const {
    page = 1,
    limit = 15,
    nip,
    nama,
    tmt_pensiun,
    skpd_id,
    status_usulan,
  } = router.query;
  const [searchValues, setSearchValues] = useState({ nip: "", nama: "" });

  const { data, isLoading, isFetching, refetch, isRefetching } = useQuery({
    queryKey: ["proxy-pensiun", router.query],
    queryFn: () => getProxyPensiunList(router.query),
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
    "pensiun",
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
    const { nip, nama, tmt_pensiun, skpd_id, status_usulan, ...rest } =
      router.query;
    router.push({ pathname: router.pathname, query: { ...rest, page: 1 } });
  };

  const handleTmtPensiunChange = (date) => {
    if (date) {
      const tmtValue = date.format("YYYY-MM");
      updateQuery({ tmt_pensiun: tmtValue });
    } else {
      updateQuery({ tmt_pensiun: undefined });
    }
  };

  const handleSkpdChange = (value) => {
    updateQuery({ skpd_id: value || undefined });
  };

  const handleStatusUsulChange = (value) => {
    // Pastikan string kosong tidak dikirim
    updateQuery({ status_usulan: value && value !== "" ? value : undefined });
  };

  const hasFilters = nip || nama || tmt_pensiun || skpd_id || status_usulan;

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
      title: "Jenis & Golongan",
      key: "jenis_golongan",
      width: 220,
      render: (_, record) => {
        const jenis = record.detail_layanan_nama;
        const golongan = record.usulan_data?.data?.golongan_kpp_nama;
        return (
          <div style={{ lineHeight: "1.4" }}>
            <Text size="xs" fw={500} style={{ marginBottom: 4 }}>
              {jenis || "-"}
            </Text>
            {golongan && (
              <Text size="10px" c="dimmed">
                Golongan: <strong>{golongan}</strong>
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "TMT Pensiun",
      key: "tmt_pensiun",
      width: 120,
      render: (_, record) => {
        const tmt = record.usulan_data?.data?.tmt_pensiun;
        return (
          <div style={{ lineHeight: "1.6" }}>
            {tmt ? (
              <Tooltip title={dayjs(tmt).format("DD MMMM YYYY")}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    cursor: "pointer",
                  }}
                >
                  <IconCalendar size={12} color="#ff4d4f" />
                  <Text size="xs" c="red" fw={500}>
                    {dayjs(tmt).format("DD/MM/YY")}
                  </Text>
                </div>
              </Tooltip>
            ) : (
              <Text size="10px" c="dimmed">
                TMT: -
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Unit Kerja",
      key: "unor",
      ellipsis: true,
      render: (_, record) => {
        const opd = record.pegawai?.opd_master;
        return (
          <Tooltip title={opd}>
            <Text
              size="11px"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {opd || "-"}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: "Status & Dokumen",
      key: "status_dokumen",
      width: 200,
      render: (_, record) => {
        const hasPertek = record.path_pertek;
        const hasSk = record.path_sk;
        const alasanTolak = record.alasan_tolak_tambahan;
        const status = record.status_usulan_nama;
        const statusId = record.status_usulan;

        const getStatusColor = (id) => {
          if (!id) return "default";
          const idNum = parseInt(id);
          if (idNum === 1) return "orange";
          if (idNum === 2) return "blue";
          if (idNum === 3) return "green";
          if (idNum === 4) return "red";
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
                  styles={{ label: { fontSize: "10px" } }}
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
                    href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_pertek}`}
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
                    href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_sk}`}
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

            {/* Jika tidak ada */}
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
          <Link href={`/rekon/pegawai/${nip}/detail`} passHref legacyBehavior>
            <a target="_blank" rel="noreferrer">
              <Button
                type="primary"
                size="small"
                icon={<IconEye size={14} />}
                style={{
                  fontSize: "11px",
                  height: "24px",
                  padding: "0 8px",
                }}
              >
                Detail
              </Button>
            </a>
          </Link>
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
          background: "#52C41A",
          padding: "16px",
          borderRadius: "8px 8px 0 0",
          margin: "-16px -16px 16px -16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconUserOff size={20} color="white" />
          <Text fw={600} size="md" style={{ color: "white" }}>
            Data Pensiun
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
            placeholder="TMT Pensiun"
            picker="month"
            allowClear
            value={tmt_pensiun ? dayjs(tmt_pensiun, "YYYY-MM") : null}
            onChange={handleTmtPensiunChange}
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
        scroll={{ x: 1200 }}
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
              <IconUserOff size={48} color="#d9d9d9" />
              <br />
              <Text c="dimmed" size="sm">
                Belum ada data pensiun
              </Text>
            </div>
          ),
        }}
      />
    </Card>
  );
};

export default ProxyPensiunComponent;
