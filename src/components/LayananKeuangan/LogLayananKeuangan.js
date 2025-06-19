import { localHistories } from "@/services/bankjatim.services";
import {
  ApiOutlined,
  BugOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  FileTextOutlined,
  GlobalOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { createStyles } from "antd-style";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";

const { Title, Text } = Typography;

const useStyle = createStyles(({ token, css }) => ({
  container: css`
    padding: 24px;
    background: #f5f5f5;
    min-height: 100vh;
  `,
  headerCard: css`
    border-radius: 12px;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 24px;
  `,
  headerSection: css`
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
    color: white;
    padding: 24px;
    text-align: center;
    border-radius: 12px 12px 0 0;
  `,
  iconWrapper: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    margin-bottom: 16px;
    font-size: 20px;
  `,
  actionSection: css`
    padding: 20px 24px;
    background: white;
    border-radius: 0 0 12px 12px;
  `,
  tableCard: css`
    border-radius: 12px;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  `,
  customTable: css`
    .ant-table-thead > tr > th {
      background: #f8fafc !important;
      border-bottom: 2px solid #e2e8f0 !important;
      font-weight: 600 !important;
      color: #374151 !important;
      padding: 16px !important;
    }

    .ant-table-tbody > tr > td {
      padding: 16px !important;
      border-bottom: 1px solid #f1f5f9 !important;
    }

    .ant-table-tbody > tr:hover > td {
      background: #f8fafc !important;
    }

    .ant-table-pagination {
      margin: 24px 24px 8px 0 !important;
    }
  `,
  statusTag: css`
    border-radius: 6px;
    font-weight: 500;
    padding: 4px 8px;
  `,
  actionButton: css`
    border-radius: 8px !important;
    font-weight: 500 !important;
    height: 40px !important;

    &.ant-btn-primary {
      background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%) !important;
      border: none !important;

      &:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3) !important;
      }
    }
  `,
  jsonModal: css`
    .ant-modal-content {
      border-radius: 12px !important;
    }
    .ant-modal-header {
      border-radius: 12px 12px 0 0 !important;
      background: #f8fafc !important;
    }
  `,
}));

const LogLayananKeuangan = () => {
  const { styles } = useStyle();
  const router = useRouter();
  const { page, limit, sort } = router.query;

  const { mutateAsync: unduh, isLoading: isUnduhLoading } = useMutation(
    (data) => localHistories(data),
    {}
  );

  const handleDownload = async () => {
    const result = await unduh({ page: -1, limit: -1 });
    const workbook = XLSX.utils.book_new();
    const sheetData = result?.map((item) => ({
      NIP: item.user?.employee_number,
      Nama: item.user?.username,
      IP: item.ip,
      Service: item.services,
      Endpoint: item.endpoint,
      Request: JSON.stringify(item.request_body),
      Response: JSON.stringify(item.response_body),
      Status: item.response_body?.response_code,
    }));
    const sheet = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    saveAs(new Blob([excelBuffer]), "log-layanan-keuangan.xlsx");
  };

  const { data, isLoading, isFetching, refetch, isRefetching } = useQuery({
    queryKey: ["logs", page, limit, sort],
    queryFn: () => localHistories({ page, limit, sort }),
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const getStatusColor = (responseCode) => {
    switch (responseCode) {
      case "00":
        return "success";
      case "05":
        return "error";
      default:
        return "warning";
    }
  };

  const getStatusText = (responseCode) => {
    switch (responseCode) {
      case "00":
        return "Berhasil";
      case "05":
        return "Gagal";
      default:
        return "Unknown";
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
      align: "center",
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      width: 280,
      render: (user, record) => (
        <Space>
          <Avatar src={user?.image} icon={<UserOutlined />} size="small" />
          <Space direction="vertical" size={0}>
            <Text strong style={{ fontSize: "13px" }}>
              {user?.username || record.user_id}
            </Text>
            <Text code style={{ fontSize: "11px", color: "#6b7280" }}>
              NIP: {user?.employee_number || "-"}
            </Text>
            <Text code style={{ fontSize: "10px", color: "#9ca3af" }}>
              ID: {user?.custom_id || record.user_id}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "IP Address",
      dataIndex: "ip",
      key: "ip",
      width: 130,
      render: (text) => (
        <Space>
          <GlobalOutlined style={{ color: "#6b7280" }} />
          <Text code style={{ fontSize: "12px" }}>
            {text}
          </Text>
        </Space>
      ),
    },
    {
      title: "Service",
      dataIndex: "services",
      key: "services",
      width: 100,
      render: (text) => (
        <Tag color="blue" className={styles.statusTag}>
          {text}
        </Tag>
      ),
    },
    {
      title: "Endpoint",
      dataIndex: "endpoint",
      key: "endpoint",
      width: 140,
      render: (text) => (
        <Space>
          <ApiOutlined style={{ color: "#6b7280" }} />
          <Text code>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Request",
      dataIndex: "request_body",
      key: "request_body",
      width: 150,
      render: (record) => (
        <Space direction="vertical" size={2}>
          {Object.entries(record || {}).map(([key, value]) => (
            <Text key={key} style={{ fontSize: "12px" }}>
              <Text strong>{key}:</Text> {value}
            </Text>
          ))}
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "response_body",
      key: "status",
      width: 100,
      align: "center",
      render: (response) => {
        const responseCode = response?.response_code;
        return (
          <Tag
            color={getStatusColor(responseCode)}
            className={styles.statusTag}
          >
            {getStatusText(responseCode)}
          </Tag>
        );
      },
    },
    {
      title: "Response",
      dataIndex: "response_body",
      key: "response_body",
      width: 200,
      render: (response) => (
        <Tooltip title={response?.response_description}>
          <Text
            ellipsis
            style={{
              maxWidth: "180px",
              fontSize: "12px",
              color: response?.response_code === "05" ? "#ef4444" : "#374151",
            }}
          >
            {response?.response_description}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Waktu",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      render: (text) => (
        <Space direction="vertical" size={2}>
          <Space>
            <ClockCircleOutlined style={{ color: "#6b7280" }} />
            <Text style={{ fontSize: "12px" }}>
              {dayjs(text).format("DD/MM/YYYY")}
            </Text>
          </Space>
          <Text style={{ fontSize: "11px", color: "#6b7280" }}>
            {dayjs(text).format("HH:mm:ss")}
          </Text>
        </Space>
      ),
    },
  ];

  const tableData = data?.results || [];

  return (
    <div className={styles.container}>
      {/* Header Card */}
      <Card className={styles.headerCard} bodyStyle={{ padding: 0 }}>
        <div className={styles.headerSection}>
          <div className={styles.iconWrapper}>
            <FileTextOutlined />
          </div>
          <Title level={3} style={{ color: "white", margin: "0 0 8px 0" }}>
            Log Layanan Keuangan
          </Title>
          <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 14 }}>
            Monitoring dan tracking aktivitas layanan Bank Jatim
          </Text>
        </div>

        <div className={styles.actionSection}>
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col>
              <Space>
                <Text strong style={{ color: "#374151" }}>
                  Total Records: {data?.total || 0}
                </Text>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button
                  type="default"
                  icon={<ReloadOutlined />}
                  loading={isLoading || isRefetching}
                  onClick={() => refetch()}
                  className={styles.actionButton}
                >
                  Refresh
                </Button>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  loading={isUnduhLoading}
                  onClick={handleDownload}
                  className={styles.actionButton}
                >
                  Unduh Data
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Table Card */}
      <Card className={styles.tableCard} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="id"
          loading={isLoading}
          className={styles.customTable}
          scroll={{ x: 1200 }}
          pagination={{
            total: data?.total || 0,
            pageSize: limit || 10,
            current: page || 1,
            onChange: (page, limit) => {
              router.push({
                pathname: router.pathname,
                query: { page, limit, sort },
              });
            },
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} records`,
          }}
          locale={{
            emptyText: (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <BugOutlined
                  style={{ fontSize: 48, color: "#d1d5db", marginBottom: 16 }}
                />
                <div>
                  <Text style={{ color: "#6b7280", fontSize: 16 }}>
                    Tidak ada data log
                  </Text>
                </div>
                <div>
                  <Text style={{ color: "#9ca3af", fontSize: 14 }}>
                    Belum ada aktivitas yang tercatat
                  </Text>
                </div>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default LogLayananKeuangan;
