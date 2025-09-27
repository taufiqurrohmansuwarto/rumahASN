import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Tag,
  Descriptions,
  Timeline,
  Spin,
  Tabs,
  Badge,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  UserOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { useDocument, useDocumentHistory, useDownloadDocument, usePreviewDocument } from "@/hooks/esign-bkd";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const StatusBadge = ({ status }) => {
  const statusConfig = {
    draft: { color: "default", text: "Draft" },
    pending: { color: "processing", text: "Pending" },
    in_review: { color: "warning", text: "Review" },
    signed: { color: "success", text: "Ditandatangani" },
    completed: { color: "success", text: "Selesai" },
    rejected: { color: "error", text: "Ditolak" },
    cancelled: { color: "default", text: "Dibatalkan" },
  };

  const config = statusConfig[status] || statusConfig.draft;
  return <Badge status={config.color} text={config.text} />;
};

const WorkflowTimeline = ({ data }) => {
  const timelineItems = data?.map((item) => ({
    color: item.status === "completed" ? "green" : item.status === "rejected" ? "red" : "blue",
    dot: item.status === "completed" ? <ClockCircleOutlined /> : <UserOutlined />,
    children: (
      <div>
        <div style={{ fontWeight: 500 }}>{item.action}</div>
        <div style={{ fontSize: 12, color: "#666" }}>
          {item.user_name} • {dayjs(item.created_at).format("DD MMM YYYY HH:mm")}
        </div>
        {item.notes && (
          <div style={{ fontSize: 12, marginTop: 4, fontStyle: "italic" }}>
            "{item.notes}"
          </div>
        )}
      </div>
    ),
  }));

  return <Timeline items={timelineItems} />;
};

function DocumentDetail() {
  const router = useRouter();
  const { id } = router.query;

  const { data: document, isLoading } = useDocument(id);
  const { data: history, isLoading: historyLoading } = useDocumentHistory(id);
  const { mutateAsync: downloadDocument, isLoading: downloadLoading } = useDownloadDocument();
  const { mutateAsync: previewDocument, isLoading: previewLoading } = usePreviewDocument();

  const handleDownload = async () => {
    try {
      await downloadDocument({ id, filename: document?.filename });
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handlePreview = async () => {
    try {
      await previewDocument(id);
    } catch (error) {
      console.error("Preview error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 text-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-4 md:p-6 text-center">
        <Text>Dokumen tidak ditemukan</Text>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
          >
            Kembali
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <FileTextOutlined />
                Detail Dokumen
              </Space>
            }
            extra={
              <Space>
                <Button
                  icon={<EyeOutlined />}
                  onClick={handlePreview}
                  loading={previewLoading}
                >
                  Preview
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                  loading={downloadLoading}
                  type="primary"
                >
                  Download
                </Button>
              </Space>
            }
          >
            <Title level={4}>{document.title}</Title>
            <div className="mb-4">
              <StatusBadge status={document.status} />
            </div>

            <Descriptions column={{ xs: 1, md: 2 }} bordered size="small">
              <Descriptions.Item label="Deskripsi" span={2}>
                {document.description || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Dibuat oleh">
                {document.created_by?.name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tanggal dibuat">
                {dayjs(document.created_at).format("DD MMMM YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Ukuran file">
                {document.file_size ? `${(document.file_size / 1024 / 1024).toFixed(2)} MB` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tipe file">
                {document.file_type || "PDF"}
              </Descriptions.Item>
              <Descriptions.Item label="Visibilitas">
                <Tag color={document.is_public ? "blue" : "default"}>
                  {document.is_public ? "Publik" : "Privat"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Terakhir diperbarui">
                {dayjs(document.updated_at).format("DD MMMM YYYY HH:mm")}
              </Descriptions.Item>
            </Descriptions>

            {document.status !== "draft" && (
              <>
                <Divider />
                <div>
                  <Title level={5}>Informasi Workflow</Title>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Total Penandatangan">
                      {document.total_signers || 0} orang
                    </Descriptions.Item>
                    <Descriptions.Item label="Sudah Ditandatangani">
                      {document.signed_count || 0} orang
                    </Descriptions.Item>
                    <Descriptions.Item label="Progress">
                      <div style={{ width: 200 }}>
                        <div className="bg-gray-200 rounded h-2">
                          <div
                            className="bg-blue-500 h-2 rounded"
                            style={{
                              width: `${((document.signed_count || 0) / (document.total_signers || 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <Text style={{ fontSize: 12 }}>
                          {((document.signed_count || 0) / (document.total_signers || 1) * 100).toFixed(0)}% selesai
                        </Text>
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <HistoryOutlined />
                Riwayat Aktivitas
              </Space>
            }
            loading={historyLoading}
          >
            {history && history.length > 0 ? (
              <WorkflowTimeline data={history} />
            ) : (
              <Text type="secondary">Belum ada aktivitas</Text>
            )}
          </Card>
        </Col>
      </Row>

      {document.status === "draft" && (
        <div className="mt-6 text-center">
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => router.push(`/esign-bkd/documents/${id}/edit`)}
            >
              Edit Dokumen
            </Button>
            <Button
              type="primary"
              onClick={() => router.push(`/esign-bkd/documents/${id}/workflow`)}
            >
              Setup Workflow
            </Button>
          </Space>
        </div>
      )}
    </div>
  );
}

export default DocumentDetail;