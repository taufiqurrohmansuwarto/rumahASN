import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Input,
  Badge,
  Dropdown,
  Progress,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useRouter } from "next/router";
import { useSignatureRequests } from "@/hooks/esign-bkd";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const { Title } = Typography;
const { Search } = Input;

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: "processing", text: "Menunggu" },
    in_progress: { color: "warning", text: "Proses" },
    completed: { color: "success", text: "Selesai" },
    cancelled: { color: "default", text: "Dibatalkan" },
    rejected: { color: "error", text: "Ditolak" },
  };

  const config = statusConfig[status] || statusConfig.pending;
  return <Badge status={config.color} text={config.text} />;
};

const PriorityTag = ({ priority }) => {
  const priorityConfig = {
    low: { color: "default", text: "Rendah" },
    normal: { color: "blue", text: "Normal" },
    high: { color: "orange", text: "Tinggi" },
    urgent: { color: "red", text: "Mendesak" },
  };

  const config = priorityConfig[priority] || priorityConfig.normal;
  return <Tag color={config.color}>{config.text}</Tag>;
};

const WorkflowProgress = ({ signed, total }) => {
  const percentage = total > 0 ? Math.round((signed / total) * 100) : 0;

  return (
    <div style={{ width: 100 }}>
      <Progress
        percent={percentage}
        size="small"
        format={() => `${signed}/${total}`}
      />
    </div>
  );
};

function SignatureRequestList() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    priority: "",
  });

  const { data, isLoading } = useSignatureRequests(filters);

  const handleSearch = (value) => {
    setFilters({ ...filters, search: value, page: 1 });
  };

  const filterItems = [
    {
      key: "status",
      label: "Filter Status",
      children: [
        { key: "", label: "Semua Status" },
        { key: "pending", label: "Menunggu" },
        { key: "in_progress", label: "Dalam Proses" },
        { key: "completed", label: "Selesai" },
        { key: "rejected", label: "Ditolak" },
      ],
    },
    {
      key: "priority",
      label: "Filter Prioritas",
      children: [
        { key: "", label: "Semua Prioritas" },
        { key: "urgent", label: "Mendesak" },
        { key: "high", label: "Tinggi" },
        { key: "normal", label: "Normal" },
        { key: "low", label: "Rendah" },
      ],
    },
  ];

  const columns = [
    {
      title: "Dokumen",
      key: "document",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            {record.document?.title || record.title}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            ID: {record.id}
          </div>
          <Space size="small" style={{ marginTop: 4 }}>
            <PriorityTag priority={record.priority} />
            {record.deadline && (
              <Tag color={dayjs(record.deadline).isBefore(dayjs()) ? "red" : "blue"}>
                {dayjs(record.deadline).format("DD MMM")}
              </Tag>
            )}
          </Space>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: "Progress",
      key: "progress",
      width: 120,
      render: (_, record) => (
        <WorkflowProgress
          signed={record.signed_count || 0}
          total={record.total_signers || 0}
        />
      ),
    },
    {
      title: "Dibuat",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (date) => dayjs(date).format("DD MMM YYYY"),
      responsive: ["md"],
    },
    {
      title: "Pemohon",
      key: "requester",
      width: 120,
      render: (_, record) => record.created_by?.name || "-",
      responsive: ["lg"],
    },
    {
      title: "Aksi",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Lihat Detail">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() =>
                router.push(`/esign-bkd/signature-requests/${record.id}`)
              }
            />
          </Tooltip>
          {record.can_review && (
            <Tooltip title="Review">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() =>
                  router.push(`/esign-bkd/signature-requests/${record.id}/review`)
                }
              />
            </Tooltip>
          )}
          {record.can_sign && (
            <Tooltip title="Tanda Tangan">
              <Button
                type="text"
                icon={<CheckOutlined />}
                onClick={() =>
                  router.push(`/esign-bkd/signature-requests/${record.id}/sign`)
                }
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <Card>
        <div className="mb-4">
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                <Space>
                  <TeamOutlined />
                  Permintaan Tanda Tangan
                </Space>
              </Title>
            </Col>
          </Row>
        </div>

        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} md={12} lg={8}>
            <Search
              placeholder="Cari permintaan..."
              allowClear
              onSearch={handleSearch}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Dropdown
              menu={{
                items: filterItems.flatMap((group) => [
                  { type: "group", label: group.label },
                  ...group.children.map((item) => ({
                    key: `${group.key}-${item.key}`,
                    label: item.label,
                    onClick: () =>
                      setFilters({
                        ...filters,
                        [group.key]: item.key,
                        page: 1,
                      }),
                  })),
                ]),
              }}
            >
              <Button icon={<FilterOutlined />}>
                Filter
              </Button>
            </Dropdown>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 800 }}
          rowClassName={(record) => {
            if (record.status === "rejected") return "opacity-75";
            if (record.can_sign || record.can_review) return "bg-blue-50";
            return "";
          }}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} permintaan`,
            onChange: (page, size) =>
              setFilters({ ...filters, page, limit: size }),
          }}
        />
      </Card>
    </div>
  );
}

export default SignatureRequestList;