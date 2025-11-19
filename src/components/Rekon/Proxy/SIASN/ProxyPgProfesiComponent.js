import { useDownloadProxyExcel } from "@/components/Rekon/Proxy/hooks/useDownloadProxyExcel";
import { getOpdFasilitator } from "@/services/master.services";
import { getProxyPgProfesiList } from "@/services/siasn-proxy.services";
import { refStatusUsul } from "@/services/siasn-services";
import { Badge, Text } from "@mantine/core";
import {
  IconAlertCircle,
  IconCertificate,
  IconDownload,
  IconEye,
  IconRefresh,
  IconSearch,
  IconUser,
  IconUserOff,
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
import { useRouter } from "next/router";
import { useState } from "react";

const ProxyPgProfesiComponent = () => {
  const router = useRouter();
  const {
    page = 1,
    limit = 15,
    nip,
    nama,
    periode_id,
    skpd_id,
    status_usulan,
  } = router.query;
  const [searchValues, setSearchValues] = useState({ nip: "", nama: "" });

  const { data, isLoading, isFetching, refetch, isRefetching } = useQuery({
    queryKey: ["proxy-pg-profesi", router.query],
    queryFn: () => getProxyPgProfesiList(router.query),
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
    "pg_profesi",
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
    const { nip, nama, periode_id, skpd_id, status_usulan, ...rest } =
      router.query;
    router.push({ pathname: router.pathname, query: rest });
  };

  const handleChangePage = (newPage, newPageSize) => {
    updateQuery({ page: newPage, limit: newPageSize }, false);
  };

  const handlePeriodeIdChange = (date, dateString) => {
    updateQuery({ periode_id: date ? date.format("YYYY-MM") : undefined });
  };

  const handleSkpdChange = (value) => {
    updateQuery({ skpd_id: value || undefined });
  };

  const handleStatusUsulChange = (value) => {
    updateQuery({ status_usulan: value && value !== "" ? value : undefined });
  };

  const hasFilters = nip || nama || periode_id || skpd_id || status_usulan;

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
            icon={<IconUser size={20} />}
          />
          <div style={{ overflow: "hidden" }}>
            <Text
              size="12px"
              weight={600}
              style={{
                display: "block",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {record.pegawai?.nama_master || record.nama}
            </Text>
            <Text
              size="11px"
              c="dimmed"
              style={{
                display: "block",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {record.pegawai?.nip_master || record.nip}
            </Text>
            <Text
              size="10px"
              c="dimmed"
              style={{
                display: "block",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={record.pegawai?.jabatan_master}
            >
              {record.pegawai?.jabatan_master || "-"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Jenis & Periode",
      key: "jenis",
      width: 220,
      render: (_, record) => (
        <div>
          <Text size="11px" weight={500} style={{ marginBottom: "4px" }}>
            {record.detail_layanan_nama || "-"}
          </Text>
          {record.periode_id && (
            <Badge color="grape" size="sm" style={{ fontSize: "10px" }}>
              {dayjs(record.periode_id).format("MMMM YYYY")}
            </Badge>
          )}
        </div>
      ),
    },
    {
      title: "Unit Kerja",
      key: "unor",
      ellipsis: true,
      render: (_, record) => (
        <div>
          <Text
            size="11px"
            style={{
              display: "block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={record.pegawai?.opd_master}
          >
            {record.pegawai?.opd_master || "-"}
          </Text>
        </div>
      ),
    },
    {
      title: "Status & Keterangan",
      key: "status",
      width: 200,
      render: (_, record) => (
        <div>
          {record.status_usulan_nama && (
            <div style={{ marginBottom: "4px" }}>
              <Badge
                color={
                  record.status_usulan === 22
                    ? "green"
                    : record.status_usulan === 23
                    ? "red"
                    : "blue"
                }
                size="sm"
                style={{ fontSize: "10px" }}
              >
                {record.status_usulan_nama}
              </Badge>
            </div>
          )}
          {record.alasan_tolak_tambahan && (
            <Tooltip title={record.alasan_tolak_tambahan}>
              <div style={{ marginTop: "4px" }}>
                <IconAlertCircle
                  size={14}
                  color="red"
                  style={{ verticalAlign: "middle", marginRight: "4px" }}
                />
                <Text
                  size="10px"
                  c="red"
                  style={{
                    display: "inline",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "150px",
                  }}
                >
                  Alasan tolak
                </Text>
              </div>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 80,
      fixed: "right",
      align: "center",
      render: (_, record) => {
        const nip = record.pegawai?.nip_master || record.nip;
        return (
          <Button
            type="link"
            size="small"
            icon={<IconEye size={14} />}
            style={{ padding: "4px 8px", fontSize: "11px" }}
            onClick={() => router.push(`/rekon/pegawai/${nip}/detail`)}
          >
            Detail
          </Button>
        );
      },
    },
  ];

  const total = data?.pagination?.total || 0;

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconCertificate size={20} />
          <Text size="14px" weight={600}>
            Data Proxy PG Profesi
          </Text>
        </div>
      }
      extra={
        <Space size="small">
          <Tooltip title="Refresh data">
            <Button
              icon={<IconRefresh size={16} />}
              onClick={() => refetch()}
              loading={isFetching || isRefetching}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Unduh Excel">
            <Button
              icon={<IconDownload size={16} />}
              onClick={handleDownload}
              loading={isDownloading}
              size="small"
              type="primary"
            />
          </Tooltip>
        </Space>
      }
      size="small"
      style={{ marginTop: 16 }}
    >
      <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="NIP"
            value={searchValues.nip}
            onChange={(e) =>
              setSearchValues({ ...searchValues, nip: e.target.value })
            }
            onPressEnter={handleSearch}
            size="small"
            prefix={<IconSearch size={14} />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Nama"
            value={searchValues.nama}
            onChange={(e) =>
              setSearchValues({ ...searchValues, nama: e.target.value })
            }
            onPressEnter={handleSearch}
            size="small"
            prefix={<IconSearch size={14} />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <DatePicker
            placeholder="Periode"
            picker="month"
            format="MMMM YYYY"
            value={periode_id ? dayjs(periode_id) : null}
            onChange={handlePeriodeIdChange}
            size="small"
            locale={locale}
            style={{ width: "100%" }}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <TreeSelect
            placeholder="Unit Kerja"
            treeData={unor}
            allowClear
            showSearch
            value={skpd_id || undefined}
            onChange={handleSkpdChange}
            loading={isLoadingUnor}
            style={{ width: "100%" }}
            size="small"
            treeNodeFilterProp="title"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
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
        <Col xs={24} sm={12} md={6}>
          <Space size="small">
            <Button
              type="primary"
              icon={<IconSearch size={14} />}
              onClick={handleSearch}
              size="small"
            >
              Cari
            </Button>
            {hasFilters && (
              <Button size="small" onClick={handleClearFilter}>
                Reset
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading || isFetching}
        rowKey="id"
        size="small"
        scroll={{ x: 1000 }}
        pagination={{
          current: parseInt(page),
          pageSize: parseInt(limit),
          total: total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total.toLocaleString("id-ID")} data`,
          onChange: handleChangePage,
          pageSizeOptions: ["10", "15", "25", "50", "100"],
          size: "small",
        }}
        locale={{
          emptyText: (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <IconUserOff size={48} color="#d9d9d9" />
              <br />
              <Text c="dimmed" size="sm">
                Tidak ada data
              </Text>
            </div>
          ),
        }}
      />
    </Card>
  );
};

export default ProxyPgProfesiComponent;
