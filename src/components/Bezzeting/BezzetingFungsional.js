import React, { useMemo, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBezzetingJf } from "@/services/bezzeting-siasn.services";
import { Table, Input, Button, Space, Typography, Card } from "antd";
import {
  FilterOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

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
            style={{ width: 90 }}
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
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
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
    },
    {
      title: "Bezzeting",
      dataIndex: "bezzeting",
      sorter: (a, b) => a?.bezzeting - b?.bezzeting,
      width: 150,
      align: "center",
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
          <Typography.Text
            style={{
              color: value > 0 ? "green" : value < 0 ? "red" : "inherit",
              fontWeight: "bold",
            }}
          >
            {text}
          </Typography.Text>
        );
      },
    },
  ];

  return (
    <Card
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            Bezzeting Jabatan Fungsional
          </Typography.Title>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isLoading}
          >
            Refresh Data
          </Button>
        </div>
      }
      style={{ margin: "20px 10px" }}
    >
      <Table
        rowKey={(record) => record.nama_jabatan}
        pagination={{
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          defaultPageSize: 10,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} data`,
        }}
        dataSource={data}
        loading={isLoading}
        columns={columns}
        scroll={{ x: "max-content" }}
        bordered
        size="middle"
      />
    </Card>
  );
}

export default BezzetingFungsional;
