import React, { useMemo, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBezzetingJf } from "@/services/bezzeting-siasn.services";
import {
  Table,
  Input,
  Button,
  Space,
  Typography,
  Card,
  Flex,
  Badge,
} from "antd";
import {
  FilterOutlined,
  SearchOutlined,
  ReloadOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

function BezzetingFungsional() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["bezzeting-fungsional"],
    queryFn: () => getBezzetingJf(),
  });

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
              backgroundColor: "#EA580C",
              borderColor: "#EA580C",
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => {
              clearFilters && handleReset(clearFilters);
              confirm();
            }}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#EA580C" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? <span>{text}</span> : text,
  });

  const uniqueJabatanNames = useMemo(() => {
    if (!data) return [];
    const names = [...new Set(data.map((item) => item.nama_jabatan))];
    return names.map((name) => ({ text: name, value: name }));
  }, [data]);

  const columns = [
    {
      title: "Nama Jabatan",
      dataIndex: "nama_jabatan",
      sorter: (a, b) => a?.nama_jabatan?.localeCompare(b?.nama_jabatan),
      filterIcon: <FilterOutlined />,
      onFilter: (value, record) => record?.nama_jabatan?.includes(value),
      filters: uniqueJabatanNames,
      ...getColumnSearchProps("nama_jabatan"),
      ellipsis: true,
    },
    {
      title: "Rekomendasi",
      dataIndex: "rekom",
      sorter: (a, b) => a?.rekom - b?.rekom,
      width: 150,
      align: "center",
      render: (text) => (
        <Badge count={text} style={{ backgroundColor: "#EA580C" }} showZero />
      ),
    },
    {
      title: "Bezzeting",
      dataIndex: "bezzeting",
      sorter: (a, b) => a?.bezzeting - b?.bezzeting,
      width: 150,
      align: "center",
      render: (text) => (
        <Badge count={text} style={{ backgroundColor: "#52C41A" }} showZero />
      ),
    },
    {
      title: "Kelebihan/Kekurangan",
      dataIndex: "status",
      sorter: (a, b) => a?.status - b?.status,
      width: 200,
      align: "center",
      render: (text) => {
        const value = parseInt(text);
        return (
          <Text
            style={{
              color: value > 0 ? "#52C41A" : value < 0 ? "#FF4D4F" : "#8C8C8C",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            {value > 0 ? `+${text}` : text}
          </Text>
        );
      },
    },
  ];

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#F5F5F5",
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
      <div style={{ marginBottom: "32px" }}>
        <Title
          level={2}
          style={{ margin: 0, color: "#1F2937", fontWeight: 700 }}
        >
          Bezzeting Jabatan Fungsional
        </Title>
        <Text type="secondary" style={{ fontSize: "16px", lineHeight: "24px" }}>
          Monitoring dan analisis kebutuhan jabatan fungsional
        </Text>
      </div>

      {/* Main Content Card */}
      <Card
        style={{
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          backgroundColor: "white",
        }}
        bodyStyle={{ padding: "32px" }}
      >
        {/* Card Header */}
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <Flex justify="space-between" align="center">
            <Flex align="center" gap={12}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  backgroundColor: "#EA580C",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BarChartOutlined
                  style={{ color: "white", fontSize: "18px" }}
                />
              </div>
              <Title level={4} style={{ margin: 0, color: "#1F2937" }}>
                Data Bezzeting
              </Title>
              {data && (
                <Badge
                  count={data.length}
                  style={{ backgroundColor: "#EA580C" }}
                />
              )}
            </Flex>

            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isLoading}
              style={{
                borderRadius: "8px",
                backgroundColor: "#EA580C",
                borderColor: "#EA580C",
                fontWeight: 500,
                fontSize: "14px",
                height: "40px",
                padding: "0 20px",
                boxShadow: "0 2px 4px rgba(234, 88, 12, 0.2)",
              }}
            >
              Refresh Data
            </Button>
          </Flex>

          {/* Table Section */}
          <div style={{ padding: "16px 0" }}>
            <Table
              rowKey={(record) => record.nama_jabatan}
              pagination={{
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50", "100"],
                defaultPageSize: 10,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} dari ${total} data`,
                style: {
                  ".ant-pagination-item-active": {
                    backgroundColor: "#EA580C",
                    borderColor: "#EA580C",
                  },
                },
              }}
              dataSource={data}
              loading={isLoading}
              columns={columns}
              scroll={{ x: "max-content" }}
              bordered={false}
              size="middle"
              style={{
                ".ant-table": {
                  backgroundColor: "white",
                },
                ".ant-table-thead > tr > th": {
                  backgroundColor: "#FFF7ED",
                  borderBottom: "1px solid #E5E7EB",
                  color: "#374151",
                  fontWeight: 600,
                },
                ".ant-table-tbody > tr:hover > td": {
                  backgroundColor: "#FFF7ED",
                },
                ".ant-table-tbody > tr > td": {
                  borderBottom: "1px solid #F3F4F6",
                },
              }}
            />
          </div>
        </Space>
      </Card>
    </div>
  );
}

export default BezzetingFungsional;
