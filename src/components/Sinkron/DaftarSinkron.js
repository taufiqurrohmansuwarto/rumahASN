import { refSinkronisasi } from "@/services/sync.services";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Grid, Space, Table, Tooltip, Typography } from "antd";
import React from "react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  SyncOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Text, Badge } from "@mantine/core";

dayjs.extend(relativeTime);

const { Title } = Typography;
const { useBreakpoint } = Grid;

function DaftarSinkron() {
  const screens = useBreakpoint();
  const isXs = !screens?.sm;

  const { data, isLoading, isFetching, refetch } = useQuery(
    ["daftar-sinkron"],
    () => refSinkronisasi(),
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  const columns = [
    {
      title: "Aplikasi",
      dataIndex: "aplikasi",
      key: "aplikasi",
      width: 180,
      render: (aplikasi) => (
        <Space size="small">
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DatabaseOutlined style={{ color: "white", fontSize: "14px" }} />
          </div>
          <Text fw={600} size="xs">
            {aplikasi || "N/A"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Layanan",
      dataIndex: "layanan",
      key: "layanan",
      width: 180,
      render: (layanan) => (
        <Badge
          color="blue"
          variant="light"
          size="sm"
          leftSection={
            <div style={{ display: "flex", alignItems: "center" }}>
              <SyncOutlined style={{ fontSize: "10px" }} />
            </div>
          }
          styles={{
            section: { display: "flex", alignItems: "center" },
            label: { display: "flex", alignItems: "center" },
          }}
        >
          {layanan || "Unknown"}
        </Badge>
      ),
    },
    {
      title: "Update Terakhir",
      key: "updated_at",
      width: 160,
      render: (_, record) => (
        <Tooltip title={dayjs(record.updated_at).format("DD-MM-YYYY HH:mm:ss")}>
          <div style={{ lineHeight: "1.1", cursor: "pointer" }}>
            <Text size="xs">
              {dayjs(record.updated_at).locale("id").fromNow()}
            </Text>
            <div style={{ marginTop: "0px" }}>
              <Text size="10px" c="dimmed">
                {dayjs(record.updated_at).format("DD/MM/YY • HH:mm")}
              </Text>
            </div>
          </div>
        </Tooltip>
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
            <SyncOutlined style={{ fontSize: "24px", marginBottom: "8px" }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Daftar Status Sinkronisasi
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
              Monitoring status sinkronisasi aplikasi dan layanan
            </Text>
          </div>

          {/* Actions Section */}
          <div
            style={{
              padding: "20px 0 16px 0",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <Space>
              <Text fw={600} size="sm" c="dimmed">
                Total: {data?.length || 0} Layanan •{" "}
                {new Set(data?.map((item) => item.aplikasi)).size || 0} Aplikasi
              </Text>
            </Space>
            <Button
              loading={isLoading || isFetching}
              onClick={() => refetch()}
              style={{
                borderRadius: 6,
                fontWeight: 500,
                padding: "0 16px",
              }}
            >
              Refresh
            </Button>
          </div>

          {/* Table Section */}
          <div style={{ marginTop: "16px" }}>
            <Table
              columns={columns}
              dataSource={data}
              loading={isLoading || isFetching}
              rowKey={(row) => row?.id}
              size="middle"
              scroll={{ x: 520 }}
              style={{
                borderRadius: "12px",
                overflow: "hidden",
              }}
              pagination={{
                position: ["bottomRight"],
                pageSize: 15,
                showSizeChanger: false,
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
                  <div style={{ padding: "60px", textAlign: "center" }}>
                    <SyncOutlined
                      style={{
                        fontSize: 64,
                        color: "#d1d5db",
                        marginBottom: 24,
                      }}
                    />
                    <div>
                      <Text size="lg" c="dimmed">
                        Tidak ada data sinkronisasi
                      </Text>
                    </div>
                    <div style={{ marginTop: "8px" }}>
                      <Text size="sm" c="dimmed">
                        Belum ada aktivitas yang tercatat
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

export default DaftarSinkron;
