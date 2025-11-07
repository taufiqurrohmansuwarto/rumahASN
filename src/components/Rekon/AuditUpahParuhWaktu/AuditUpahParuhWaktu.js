import { HistoryOutlined } from "@ant-design/icons";
import { Text } from "@mantine/core";
import { Card, Table, Typography } from "antd";
import { useRouter } from "next/router";
import useAuditLogUpahParuhWaktu from "./hooks/useAuditLogUpahParuhWaktu";
import useDownloadAuditUpahParuhWaktu from "./hooks/useDownloadAuditUpahParuhWaktu";
import AuditUpahParuhWaktuColumns from "./components/AuditUpahParuhWaktuColumns";
import AuditUpahParuhWaktuFilters from "./components/AuditUpahParuhWaktuFilters";

const { Title } = Typography;

const AuditLogUpahParuhWaktu = () => {
  const router = useRouter();
  const {
    page = 1,
    limit = 15,
    nama_operator = "",
    nama_pegawai = "",
    organization_id = "",
  } = router.query;

  const { data, isLoading, isFetching, refetch, isRefetching } =
    useAuditLogUpahParuhWaktu(router?.query);

  const { downloadLog, isMutating } = useDownloadAuditUpahParuhWaktu();

  const handleDownloadLog = () => {
    downloadLog({ ...router.query, limit: -1 });
  };

  const handleSearch = (field, value) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        [field]: value || undefined,
        page: 1,
      },
    });
  };

  const clearFilters = () => {
    router.push({
      pathname: router.pathname,
      query: {
        page: 1,
        limit: router.query.limit || 15,
      },
    });
  };

  const columns = AuditUpahParuhWaktuColumns();
  const tableData = data?.data || [];
  const hasFilters = nama_operator || nama_pegawai || organization_id;

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
            <HistoryOutlined
              style={{ fontSize: "24px", marginBottom: "8px" }}
            />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Audit Upah Paruh Waktu
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
              Riwayat perubahan upah pegawai paruh waktu
            </Text>
          </div>

          {/* Filter and Actions Section */}
          <AuditUpahParuhWaktuFilters
            nama_operator={nama_operator}
            nama_pegawai={nama_pegawai}
            hasFilters={hasFilters}
            isLoading={isLoading}
            isRefetching={isRefetching}
            isMutating={isMutating}
            onSearch={handleSearch}
            onClearFilters={clearFilters}
            onRefresh={refetch}
            onDownload={handleDownloadLog}
          />

          {/* Table Section */}
          <div style={{ marginTop: "16px" }}>
            <Table
              columns={columns}
              dataSource={tableData}
              rowKey="id"
              loading={isLoading || isFetching}
              scroll={{ x: 950 }}
              size="middle"
              style={{
                borderRadius: "12px",
                overflow: "hidden",
              }}
              pagination={{
                position: ["bottomRight"],
                total: data?.total || 0,
                pageSize: parseInt(limit),
                current: parseInt(page),
                showSizeChanger: true,
                pageSizeOptions: ["10", "15", "25", "50", "100"],
                onChange: (newPage, newPageSize) => {
                  router.push({
                    pathname: router.pathname,
                    query: {
                      ...router.query,
                      page: newPage,
                      limit: newPageSize,
                    },
                  });
                },
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
                    <HistoryOutlined
                      style={{
                        fontSize: 64,
                        color: "#d1d5db",
                        marginBottom: 24,
                      }}
                    />
                    <div>
                      <Text size="lg" c="dimmed">
                        Tidak ada data audit
                      </Text>
                    </div>
                    <div style={{ marginTop: "8px" }}>
                      <Text size="sm" c="dimmed">
                        Belum ada perubahan upah yang tercatat
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
};

export default AuditLogUpahParuhWaktu;
