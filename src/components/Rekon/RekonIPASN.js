import React from "react";
import {
  getRekonIPASNDashboard,
  syncRekonIPASN,
} from "@/services/rekon.services";
import { SearchOutlined, TeamOutlined, SyncOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Space,
  Table,
  Typography,
  message,
  Skeleton,
  Flex,
  Badge,
  Tag,
} from "antd";
import { useRouter } from "next/router";

const { Title, Text } = Typography;

function RekonIPASN() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["rekon-ipasn"],
    queryFn: getRekonIPASNDashboard,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const { mutate: syncRekonIpasn, isLoading: isSyncRekonIpasnLoading } =
    useMutation({
      mutationFn: () => syncRekonIPASN(),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["rekon-ipasn"] });
        message.success("Data berhasil disinkronisasi");
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    });

  const handleSyncRekonIpasn = () => {
    syncRekonIpasn();
  };

  const columns = [
    {
      title: "Perangkat Daerah",
      dataIndex: "name",
      filterSearch: true,
      filters: data?.data?.map((item) => ({
        text: item?.name,
        value: item?.name,
      })),
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => (
        <Text strong style={{ color: "#374151" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "PNS",
      dataIndex: "rerata_total_pns",
      sorter: (a, b) => a.rerata_total_pns - b.rerata_total_pns,
      align: "center",
      render: (value) => (
        <Tag color="#6366F1" style={{ fontWeight: 500 }}>
          {value}
        </Tag>
      ),
    },
    {
      title: "PPPK",
      dataIndex: "rerata_total_pppk",
      sorter: (a, b) => a.rerata_total_pppk - b.rerata_total_pppk,
      align: "center",
      render: (value) => (
        <Tag color="#22C55E" style={{ fontWeight: 500 }}>
          {value}
        </Tag>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#FAFAFB",
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
      <div style={{ marginBottom: "32px" }}>
        <Flex justify="space-between" align="center">
          <div>
            <Title
              level={2}
              style={{ margin: 0, color: "#1F2937", fontWeight: 700 }}
            >
              IPASN Pemprov Jatim
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: "16px", lineHeight: "24px" }}
            >
              Monitoring data IPASN dan sinkronisasi informasi pegawai
            </Text>
          </div>
          <Space>
            <Button
              type="default"
              icon={<SyncOutlined />}
              loading={isSyncRekonIpasnLoading}
              disabled={isSyncRekonIpasnLoading}
              onClick={handleSyncRekonIpasn}
              style={{
                borderRadius: "8px",
                fontWeight: 500,
                height: "40px",
                padding: "0 16px",
              }}
            >
              Sinkronkan Data
            </Button>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => router.push("/rekon/dashboard/ipasn")}
              style={{
                borderRadius: "8px",
                fontWeight: 500,
                height: "40px",
                padding: "0 20px",
              }}
            >
              Detail Dashboard
            </Button>
          </Space>
        </Flex>
      </div>

      {/* Data Table Section */}
      <Card
        style={{
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
        bodyStyle={{ padding: "32px" }}
      >
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={12}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  backgroundColor: "#6366F1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TeamOutlined style={{ color: "white", fontSize: "18px" }} />
              </div>
              <Title level={4} style={{ margin: 0, color: "#1F2937" }}>
                Data Perangkat Daerah
              </Title>
              <Badge
                count={data?.data?.length || 0}
                style={{ backgroundColor: "#6366F1" }}
              />
            </Flex>
          </Flex>

          {isLoading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <Table
              rowKey={(row) => row?.id}
              dataSource={data?.data}
              loading={isLoading}
              columns={columns}
              pagination={{
                pageSize: 15,
                position: ["bottomRight"],
                showSizeChanger: false,
                showTotal: (total) => `Total ${total} item`,
                style: { marginTop: "24px" },
              }}
              sortDirections={["ascend", "descend"]}
              scroll={{ x: "max-content" }}
              style={{ borderRadius: "8px" }}
            />
          )}
        </Space>
      </Card>
    </div>
  );
}

export default RekonIPASN;
