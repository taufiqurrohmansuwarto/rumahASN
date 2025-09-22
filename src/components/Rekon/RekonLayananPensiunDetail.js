import {
  getPemberhentianByPegawai,
  getUnorSimaster,
} from "@/services/rekon.services";
import { clearQuery } from "@/utils/client-utils";
import { Badge, Text, Title } from "@mantine/core";
import {
  IconBuilding,
  IconCalendar,
  IconDownload,
  IconFileCheck,
  IconRefresh,
  IconSearch,
  IconTrendingUp,
  IconUser,
  IconX,
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
  Space,
  Table,
  Tooltip,
  TreeSelect,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";

const DEFAULT_PERIODE = "01-04-2025";
const queryFormat = "DD-MM-YYYY";
const format = "MM-YYYY";

const getFirstDayOfMonth = (date) => {
  return dayjs(date).startOf("month").format(queryFormat);
};

const Filter = ({ isFetching, refetch }) => {
  const router = useRouter();
  const { data } = useQuery(["rekon-unor-simaster"], () => getUnorSimaster(), {
    refetchOnWindowFocus: false,
  });

  const handleChange = (value) => {
    const query = clearQuery({
      ...router?.query,
      skpd_id: value,
      page: 1,
    });
    router.push({ pathname: "/rekon/dashboard/pemberhentian", query });
  };

  const handleChangePeriode = (value) => {
    const query = clearQuery({
      ...router?.query,
      tmtPensiun: getFirstDayOfMonth(value),
      page: 1,
    });
    router.push({ pathname: "/rekon/dashboard/pemberhentian", query });
  };

  return (
    <div>
      <Text size="sm" fw={600} c="dimmed" style={{ marginBottom: "12px" }}>
        🔍 Filter Data
      </Text>
      <Row gutter={[12, 12]} align="middle" justify="space-between">
        <Col xs={24} lg={18}>
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={16} md={14}>
              <TreeSelect
                treeNodeFilterProp="title"
                placeholder="Pilih unit organisasi..."
                listHeight={400}
                showSearch
                style={{
                  width: "100%",
                  borderRadius: "8px",
                }}
                size="middle"
                treeData={data}
                value={router?.query?.skpd_id}
                onSelect={handleChange}
                suffixIcon={
                  <IconBuilding size={16} style={{ color: "#999" }} />
                }
              />
            </Col>
            <Col xs={24} sm={8} md={10}>
              <DatePicker.MonthPicker
                format={{
                  format,
                  type: "mask",
                }}
                onChange={handleChangePeriode}
                allowClear={false}
                defaultValue={dayjs(DEFAULT_PERIODE, queryFormat)}
                placeholder="Pilih periode..."
                style={{
                  width: "100%",
                  borderRadius: "8px",
                }}
                size="middle"
              />
            </Col>
          </Row>
        </Col>
        <Col xs={24} lg={6}>
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
          >
            <Tooltip title="Reload data">
              <Button
                loading={isFetching}
                onClick={() => refetch()}
                icon={<IconRefresh size={16} />}
                style={{
                  borderColor: "#FF4500",
                  color: "#FF4500",
                  borderRadius: "6px",
                }}
                size="middle"
              />
            </Tooltip>
          </div>
        </Col>
      </Row>
    </div>
  );
};

function RekonLayananPensiunDetail() {
  const router = useRouter();
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["rekon-pensiun-by-pegawai", router?.query],
    queryFn: () => getPemberhentianByPegawai(router?.query),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const handleChangePage = (page, pageSize) => {
    const query = clearQuery({
      ...router?.query,
      page,
      perPage: pageSize,
    });

    router.push({
      pathname: "/rekon/dashboard/pemberhentian",
      query,
    });
  };

  const handleSearch = (value) => {
    const query = clearQuery({
      ...router?.query,
      search: value,
      page: 1,
    });
    router.push({ pathname: "/rekon/dashboard/pemberhentian", query });
  };

  const renderSearchFilter = ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }) => (
    <div style={{ padding: 8 }}>
      <Input
        placeholder="Cari nama pegawai..."
        value={selectedKeys[0] || router?.query?.search}
        onChange={(e) =>
          setSelectedKeys(e.target.value ? [e.target.value] : [])
        }
        onPressEnter={() => {
          confirm();
          handleSearch(selectedKeys[0]);
        }}
        style={{ width: 300, marginBottom: 8, display: "block" }}
        prefix={<IconSearch size={16} style={{ color: "#999" }} />}
      />
      <Space>
        <Button
          type="primary"
          onClick={() => {
            confirm();
            handleSearch(selectedKeys[0]);
          }}
          icon={<IconSearch size={14} />}
          size="small"
          style={{
            width: 90,
            backgroundColor: "#FF4500",
            borderColor: "#FF4500",
          }}
        >
          Cari
        </Button>
        <Button
          onClick={() => {
            clearFilters();
            setSelectedKeys([]);
            handleSearch(undefined);
          }}
          icon={<IconX size={14} />}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </Space>
    </div>
  );

  const columns = [
    {
      title: "Pegawai",
      key: "pegawai_info",
      width: 300,
      render: (_, record) => (
        <Space size="small">
          <Avatar
            src={record?.foto_master}
            size={40}
            style={{
              border: "2px solid #f0f0f0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
            icon={<IconUser size={16} />}
          />
          <div style={{ lineHeight: "1.1" }}>
            <div>
              <Text
                fw={600}
                size="sm"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  router.push(`/rekon/pegawai/${record?.nip_master}/detail`)
                }
              >
                {record?.nama_master}
              </Text>
            </div>
            {record?.nip_master && (
              <div style={{ marginTop: "1px" }}>
                <Text size="xs" c="dimmed" ff="monospace">
                  {record?.nip_master}
                </Text>
              </div>
            )}
            {record?.jabatan_master && (
              <div style={{ marginTop: "2px" }}>
                <Text
                  size="xs"
                  c="dimmed"
                  truncate
                  style={{ maxWidth: "200px" }}
                >
                  {record?.jabatan_master?.length > 30
                    ? `${record?.jabatan_master?.substring(0, 30)}...`
                    : record?.jabatan_master}
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
      sorter: true,
      filterSearch: true,
      filterDropdown: renderSearchFilter,
      filterIcon: (filtered) => (
        <IconSearch
          size={16}
          style={{ color: filtered ? "#FF4500" : "#999" }}
        />
      ),
    },
    {
      title: "Unit Organisasi",
      key: "opd_master",
      width: 200,
      render: (_, record) => (
        <Tooltip title={record?.opd_master} placement="top">
          <Text
            size="xs"
            c="dimmed"
            style={{
              maxWidth: "180px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              cursor: "help",
            }}
          >
            {record?.opd_master || "N/A"}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "TMT Pensiun",
      key: "tmt",
      width: 120,
      render: (_, record) => (
        <Text size="sm" ff="monospace">
          {record?.tmtPensiun || "N/A"}
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
            variant={isApproved ? "filled" : isRejected ? "light" : "outline"}
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
      sorter: true,
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
                  variant="gradient"
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
          {record?.pathSk && (
            <Tooltip title="Unduh file SK">
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record.pathSk}`}
                target="_blank"
                rel="noreferrer"
              >
                <Badge
                  color="blue"
                  variant="dot"
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
          {!record?.pathPertek && !record?.pathSk && (
            <Badge
              color="gray"
              variant="light"
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
              Rekon Data Pemberhentian
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 14 }}>
              Rekonisiliasi dan monitoring data pemberhentian pegawai
            </Text>
          </div>

          {/* Filter Section */}
          <div
            style={{
              padding: "20px 0 16px 0",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Filter isFetching={isFetching} refetch={refetch} />
          </div>

          {/* Table Section */}
          <div style={{ marginTop: "16px" }}>
            <Table
              columns={columns}
              rowKey={(row) => row?.nip_master || row?.id}
              dataSource={data?.data}
              loading={isLoading || isFetching}
              size="middle"
              scroll={{ x: 900 }}
              style={{
                borderRadius: "12px",
                overflow: "hidden",
              }}
              pagination={{
                position: ["bottomRight"],
                current: parseInt(router?.query?.page) || 1,
                pageSize: parseInt(router?.query?.perPage) || 10,
                showSizeChanger: false,
                total: data?.totalData,
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
                        Tidak ada data pemberhentian
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">
                        Belum ada data untuk filter yang dipilih
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

export default RekonLayananPensiunDetail;
