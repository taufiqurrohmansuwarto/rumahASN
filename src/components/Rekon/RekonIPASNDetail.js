import useScrollRestoration from "@/hooks/useScrollRestoration";
import {
  getEmployeeIPASN,
  getRekonIPASN,
  getRekonIPASNDashboard,
  getUnorSimaster,
} from "@/services/rekon.services";
import { clearQuery } from "@/utils/client-utils";
import { Badge, Text, Title } from "@mantine/core";
import {
  IconBuilding,
  IconDownload,
  IconFileSpreadsheet,
  IconRefresh,
  IconSearch,
  IconTrendingUp,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  Input,
  Row,
  Space,
  Table,
  Tooltip,
  TreeSelect,
} from "antd";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";

const DetailIPASN = () => {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["rekon-ipasn-detail", router?.query?.skpd_id],
    queryFn: () =>
      getRekonIPASNDashboard({
        skpd_id: router?.query?.skpd_id,
        type: "test",
      }),
  });

  if (isLoading || !data?.data) return null;

  return (
    <div style={{
      background: "#f8f9fa",
      padding: "16px",
      borderRadius: "8px",
      marginBottom: "16px",
      border: "1px solid #e9ecef"
    }}>
      <Text size="sm" fw={600} c="dimmed" style={{ marginBottom: "12px" }}>
        📊 Ringkasan IPASN
      </Text>
      <Row gutter={[8, 8]}>
        <Col span={6}>
          <div style={{ textAlign: "center", padding: "8px" }}>
            <Badge color="blue" variant="filled" size="lg" style={{ display: "block", marginBottom: "4px" }}>
              {data?.data?.rerata_total_pns || 0}
            </Badge>
            <Text size="xs" c="dimmed">PNS</Text>
          </div>
        </Col>
        <Col span={6}>
          <div style={{ textAlign: "center", padding: "8px" }}>
            <Badge color="green" variant="filled" size="lg" style={{ display: "block", marginBottom: "4px" }}>
              {data?.data?.rerata_total_pppk || 0}
            </Badge>
            <Text size="xs" c="dimmed">PPPK</Text>
          </div>
        </Col>
        <Col span={6}>
          <div style={{ textAlign: "center", padding: "8px" }}>
            <Badge color="orange" variant="outline" size="md" style={{ display: "block", marginBottom: "4px" }}>
              {data?.data?.rerata_kompetensi_pns || 0}/40
            </Badge>
            <Text size="xs" c="dimmed">Kompetensi PNS</Text>
          </div>
        </Col>
        <Col span={6}>
          <div style={{ textAlign: "center", padding: "8px" }}>
            <Badge color="cyan" variant="outline" size="md" style={{ display: "block", marginBottom: "4px" }}>
              {data?.data?.rerata_kompetensi_pppk || 0}/40
            </Badge>
            <Text size="xs" c="dimmed">Kompetensi PPPK</Text>
          </div>
        </Col>
      </Row>
    </div>
  );
};

const EmployeeIPASN = () => {
  useScrollRestoration();
  const router = useRouter();
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["rekon-ipasn-employees", router?.query],
    queryFn: () => getEmployeeIPASN(router?.query),
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
      pathname: "/rekon/dashboard/ipasn",
      query,
    });
  };

  const handleSearch = (value) => {
    const query = clearQuery({
      ...router?.query,
      search: value || undefined,
      page: 1, // Reset ke halaman pertama saat pencarian
    });

    router.push({
      pathname: "/rekon/dashboard/ipasn",
      query,
    });
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

  const renderValue = (value, max) => `${value || 0}/${max}`;

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
            {record?.nip && (
              <div style={{ marginTop: "1px" }}>
                <Text size="xs" c="dimmed" ff="monospace">
                  {record?.nip}
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
      title: "Status",
      key: "status",
      width: 100,
      render: (_, record) => (
        <Badge
          color={record?.status_master === "PNS" ? "blue" : "green"}
          variant="filled"
          size="sm"
        >
          {record?.status_master || "N/A"}
        </Badge>
      ),
    },
    {
      title: "Skor IPASN",
      key: "ipasn_scores",
      width: 280,
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            <Badge color="orange" variant="light" size="sm">
              Kualifikasi: {record?.kualifikasi || 0}/25
            </Badge>
            <Badge color="cyan" variant="light" size="sm">
              Kompetensi: {record?.kompetensi || 0}/40
            </Badge>
          </div>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            <Badge color="purple" variant="light" size="sm">
              Kinerja: {record?.kinerja || 0}/30
            </Badge>
            <Badge color="red" variant="light" size="sm">
              Disiplin: {record?.disiplin || 0}/5
            </Badge>
          </div>
        </div>
      ),
    },
    {
      title: "Total",
      key: "total",
      width: 80,
      render: (_, record) => (
        <Badge
          color="indigo"
          variant="filled"
          size="md"
          style={{ fontFamily: "monospace" }}
        >
          {record?.total || 0}/100
        </Badge>
      ),
      sorter: true,
    },
  ];

  return (
    <Table
      columns={columns}
      rowKey={(row) => row?.nip || row?.id}
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
            <IconUsers
              size={48}
              style={{ color: "#d1d5db", marginBottom: 16 }}
            />
            <div>
              <Text size="md" c="dimmed">
                Tidak ada data IPASN
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
  );
};

const Filter = ({ isFetching, refetch }) => {
  const router = useRouter();
  const { data } = useQuery(["rekon-unor-simaster"], () => getUnorSimaster(), {
    refetchOnWindowFocus: false,
  });

  const { mutateAsync: rekonIpasn, isLoading: isRekonIpasnLoading } =
    useMutation({
      mutationFn: () => getRekonIPASN({ skpd_id: router?.query?.skpd_id }),
    });

  const handleDownload = async () => {
    const result = await rekonIpasn();
    const { data: downloadData } = result;
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(downloadData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "IPASN");
    XLSX.writeFile(workbook, "IPASN.xlsx");
  };

  const handleChange = (value) => {
    router.push(`/rekon/dashboard/ipasn?skpd_id=${value}`);
  };

  return (
    <div>
      <Text size="sm" fw={600} c="dimmed" style={{ marginBottom: "12px" }}>
        🔍 Filter Data
      </Text>
      <Row gutter={[12, 12]} align="middle" justify="space-between">
        <Col xs={24} lg={18}>
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
            <Tooltip title="Unduh data Excel">
              <Button
                loading={isRekonIpasnLoading}
                onClick={handleDownload}
                icon={<IconFileSpreadsheet size={16} />}
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

const RekonIPASNDetail = () => {
  const router = useRouter();
  const { isFetching, refetch } = useQuery({
    queryKey: ["rekon-ipasn-employees", router?.query],
    queryFn: () => getEmployeeIPASN(router?.query),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

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
              Rekon Data IPASN
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 14 }}>
              Rekonisiliasi dan monitoring data IPASN pegawai
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

          {/* Summary Section */}
          <DetailIPASN />

          {/* Table Section */}
          <div style={{ marginTop: "16px" }}>
            <EmployeeIPASN />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RekonIPASNDetail;
