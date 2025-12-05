import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Modal,
  Typography,
  Space,
  Spin,
  Alert,
  Flex,
  Divider,
  Tag,
  Card,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  IconSparkles,
  IconReportAnalytics,
  IconAlertTriangle,
  IconBulb,
  IconChecklist,
  IconChartBar,
} from "@tabler/icons-react";
import { aiProjectSummary } from "../../../services/kanban.services";
import dayjs from "dayjs";

const { Text, Paragraph, Title } = Typography;

const statusColors = {
  Baik: "green",
  "Perlu Perhatian": "orange",
  Kritis: "red",
};

function AIProjectSummary({ projectId, projectName }) {
  const [open, setOpen] = useState(false);

  const { mutate, isLoading, data, error, reset } = useMutation(() =>
    aiProjectSummary(projectId)
  );

  const handleOpen = () => {
    setOpen(true);
    mutate();
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  // data dari mutation sudah berisi response langsung
  const result = data?.data; // { project_name, generated_at, stats, ai_summary }
  const aiSummary = result?.ai_summary;
  const stats = result?.stats;
  const generatedAt = result?.generated_at;

  return (
    <>
      <Button
        type="primary"
        icon={<IconSparkles size={16} />}
        onClick={handleOpen}
        style={{
          backgroundColor: "#fa541c",
          borderColor: "#fa541c",
        }}
      >
        Ringkas dengan AI
      </Button>

      <Modal
        title={
          <Flex gap={8} align="center">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "linear-gradient(135deg, #fa541c 0%, #ff7a45 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconReportAnalytics size={20} color="#fff" />
            </div>
            <div>
              <Text strong style={{ display: "block" }}>
                Ringkasan AI
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {projectName}
              </Text>
            </div>
          </Flex>
        }
        open={open}
        onCancel={handleClose}
        footer={
          <Flex justify="space-between" align="center">
            <Text type="secondary" style={{ fontSize: 11 }}>
              {generatedAt
                ? `Dibuat: ${dayjs(generatedAt).format("DD MMM YYYY HH:mm")}`
                : ""}
            </Text>
            <Button onClick={handleClose}>Tutup</Button>
          </Flex>
        }
        width={640}
        centered
      >
        {isLoading && (
          <Flex
            vertical
            align="center"
            justify="center"
            gap={16}
            style={{ padding: 60 }}
          >
            <Spin size="large" />
            <Text type="secondary">AI sedang menganalisis project...</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Mohon tunggu beberapa saat
            </Text>
          </Flex>
        )}

        {error && (
          <Alert
            type="error"
            message="Gagal mendapatkan ringkasan AI"
            description={error?.response?.data?.message || "Terjadi kesalahan"}
            showIcon
          />
        )}

        {result && aiSummary && (
          <div>
            {/* Status Badge */}
            <Flex justify="center" style={{ marginBottom: 16 }}>
              <Tag
                color={statusColors[aiSummary.status] || "default"}
                style={{ fontSize: 14, padding: "4px 16px" }}
              >
                Status: {aiSummary.status}
              </Tag>
            </Flex>

            {/* Stats */}
            <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
              <Col span={6}>
                <Card size="small" style={{ textAlign: "center" }}>
                  <Statistic
                    title={
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Total
                      </Text>
                    }
                    value={stats?.total_tasks || 0}
                    valueStyle={{ fontSize: 20, color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" style={{ textAlign: "center" }}>
                  <Statistic
                    title={
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Selesai
                      </Text>
                    }
                    value={stats?.completed_tasks || 0}
                    valueStyle={{ fontSize: 20, color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" style={{ textAlign: "center" }}>
                  <Statistic
                    title={
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Progress
                      </Text>
                    }
                    value={stats?.completion_rate || 0}
                    suffix="%"
                    valueStyle={{ fontSize: 20, color: "#fa541c" }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" style={{ textAlign: "center" }}>
                  <Statistic
                    title={
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Terlambat
                      </Text>
                    }
                    value={stats?.overdue_count || 0}
                    valueStyle={{
                      fontSize: 20,
                      color: stats?.overdue_count > 0 ? "#ff4d4f" : "#8c8c8c",
                    }}
                  />
                </Card>
              </Col>
            </Row>

            <Divider style={{ margin: "16px 0" }} />

            {/* Summary */}
            <Paragraph
              style={{
                fontSize: 13,
                lineHeight: 1.8,
                backgroundColor: "#fafafa",
                padding: 16,
                borderRadius: 8,
                whiteSpace: "pre-line",
              }}
            >
              {aiSummary.summary}
            </Paragraph>

            {/* Highlights */}
            {aiSummary.highlights?.length > 0 && (
              <>
                <Flex gap={8} align="center" style={{ marginTop: 16 }}>
                  <IconChecklist size={16} color="#52c41a" />
                  <Text strong style={{ color: "#52c41a" }}>
                    Poin Penting
                  </Text>
                </Flex>
                <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
                  {aiSummary.highlights.map((item, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                      <Text style={{ fontSize: 13 }}>{item}</Text>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Concerns */}
            {aiSummary.concerns?.length > 0 && (
              <>
                <Flex gap={8} align="center" style={{ marginTop: 16 }}>
                  <IconAlertTriangle size={16} color="#fa8c16" />
                  <Text strong style={{ color: "#fa8c16" }}>
                    Perlu Perhatian
                  </Text>
                </Flex>
                <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
                  {aiSummary.concerns.map((item, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                      <Text style={{ fontSize: 13 }}>{item}</Text>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Recommendations */}
            {aiSummary.recommendations?.length > 0 && (
              <>
                <Flex gap={8} align="center" style={{ marginTop: 16 }}>
                  <IconBulb size={16} color="#1890ff" />
                  <Text strong style={{ color: "#1890ff" }}>
                    Rekomendasi
                  </Text>
                </Flex>
                <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
                  {aiSummary.recommendations.map((item, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                      <Text style={{ fontSize: 13 }}>{item}</Text>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

export default AIProjectSummary;

