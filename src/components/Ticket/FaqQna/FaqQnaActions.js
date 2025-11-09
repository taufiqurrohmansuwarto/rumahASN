import {
  askFaqQna,
  bulkSyncFaqQna,
  getFaqQnaHealth,
} from "@/services/tickets-ref.services";
import { subCategories } from "@/services/index";
import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import {
  CheckCircleOutlined,
  DownOutlined,
  ReloadOutlined,
  RobotOutlined,
  SendOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Badge, Box, Group, Paper, Stack, Text } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Tag,
  message,
} from "antd";
import { useState } from "react";

const { TextArea } = Input;

function FaqQnaActions() {
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [askForm] = Form.useForm();

  // Health Check Query
  const { data: healthData, refetch: refetchHealth } = useQuery({
    queryKey: ["faq-qna-health"],
    queryFn: getFaqQnaHealth,
    enabled: healthModalOpen,
    refetchOnWindowFocus: false,
  });

  // Sub Categories Query
  const { data: dataSubCategories } = useQuery({
    queryKey: ["sub-categories", "all"],
    queryFn: () => subCategories({ limit: -1 }),
    placeholderData: (previousData) => previousData,
  });

  // Bulk Sync Mutation
  const { mutate: bulkSync, isLoading: isSyncing } = useMutation({
    mutationFn: bulkSyncFaqQna,
    onSuccess: (data) => {
      message.success(
        `Sync selesai! Berhasil: ${data.synced}, Gagal: ${data.failed}`
      );
    },
    onError: () => {
      message.error("Gagal sync ke Qdrant");
    },
  });

  // Ask AI Mutation
  const {
    mutate: askAI,
    isLoading: isAsking,
    data: aiResponse,
    reset: resetAI,
  } = useMutation({
    mutationFn: askFaqQna,
    onError: (error) => {
      message.error(error?.response?.data?.message || "Gagal bertanya ke AI");
    },
  });

  const handleBulkSync = (forceSync = false) => {
    Modal.confirm({
      title: forceSync ? "Force Sync ke Qdrant" : "Bulk Sync ke Qdrant",
      content: forceSync
        ? "Reset dan sync ulang SEMUA FAQ ke Qdrant dengan data terbaru. Proses ini akan menimpa data yang sudah ada. Lanjutkan?"
        : "Sync FAQ yang belum tersinkronisasi ke Qdrant. Lanjutkan?",
      okText: "Ya, Sync",
      okType: forceSync ? "danger" : "primary",
      cancelText: "Batal",
      onOk: () => bulkSync({ limit: 100, force: forceSync }),
    });
  };

  const handleHealthCheck = () => {
    setHealthModalOpen(true);
    refetchHealth();
  };

  const handleAskSubmit = (values) => {
    askAI(values);
  };

  const handleAskModalClose = () => {
    setAskModalOpen(false);
    askForm.resetFields();
    resetAI();
  };

  return (
    <>
      <Space>
        <Button
          icon={<RobotOutlined />}
          onClick={() => setAskModalOpen(true)}
          type="dashed"
        >
          Tanya AI
        </Button>
        <Dropdown
          menu={{
            items: [
              {
                key: "incremental",
                icon: <SyncOutlined />,
                label: "Sync Baru",
                onClick: () => handleBulkSync(false),
              },
              {
                key: "force",
                icon: <ReloadOutlined />,
                label: "Force Sync (Reset)",
                danger: true,
                onClick: () => handleBulkSync(true),
              },
            ],
          }}
        >
          <Button icon={<SyncOutlined />} loading={isSyncing}>
            Sync Qdrant <DownOutlined />
          </Button>
        </Dropdown>
        <Button
          icon={<CheckCircleOutlined />}
          onClick={handleHealthCheck}
        >
          Cek Status
        </Button>
      </Space>

      {/* Health Check Modal */}
      <Modal
        title="Status Sistem"
        open={healthModalOpen}
        onCancel={() => setHealthModalOpen(false)}
        footer={null}
        width={500}
      >
        {healthData && (
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="PostgreSQL"
                    value={healthData.services?.postgres ? "OK" : "Error"}
                    valueStyle={{
                      color: healthData.services?.postgres ? "#52c41a" : "#ff4d4f",
                      fontSize: 20,
                    }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Qdrant"
                    value={healthData.services?.qdrant ? "OK" : "Off"}
                    valueStyle={{
                      color: healthData.services?.qdrant ? "#52c41a" : "#faad14",
                      fontSize: 20,
                    }}
                  />
                </Card>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Full-text Search"
                    value={healthData.services?.fulltext ? "OK" : "Off"}
                    valueStyle={{
                      color: healthData.services?.fulltext ? "#52c41a" : "#faad14",
                      fontSize: 20,
                    }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Keyword Search"
                    value={healthData.services?.keyword ? "OK" : "Off"}
                    valueStyle={{
                      color: healthData.services?.keyword ? "#52c41a" : "#faad14",
                      fontSize: 20,
                    }}
                  />
                </Card>
              </Col>
            </Row>
            <div>
              <Tag color="blue">
                Strategi: {healthData.config?.search_strategy || "hybrid"}
              </Tag>
              <Tag color={healthData.config?.qdrant_enabled ? "green" : "red"}>
                Qdrant: {healthData.config?.qdrant_enabled ? "Aktif" : "Nonaktif"}
              </Tag>
            </div>
          </Space>
        )}
      </Modal>

      {/* Ask AI Modal */}
      <Modal
        title={
          <Space>
            <RobotOutlined style={{ color: "#1890ff" }} />
            <span>Tanya AI tentang FAQ</span>
          </Space>
        }
        open={askModalOpen}
        onCancel={handleAskModalClose}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={askForm}
          layout="vertical"
          onFinish={handleAskSubmit}
          disabled={isAsking}
        >
          <Form.Item
            name="query"
            label="Pertanyaan"
            rules={[{ required: true, message: "Wajib diisi" }]}
          >
            <TextArea
              rows={3}
              placeholder="Contoh: Bagaimana cara mengajukan kenaikan pangkat?"
              autoFocus
            />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="sub_category_id" label="Kategori (Opsional)">
                <Select
                  placeholder="Semua kategori"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  options={
                    dataSubCategories?.data
                      ? dataSubCategories.data.map((item) => ({
                          label: `${item.name} (${item.category?.name})`,
                          value: item.id,
                        }))
                      : []
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="limit" label="Jumlah Sumber" initialValue={5}>
                <Select
                  options={[
                    { label: "3 sumber", value: 3 },
                    { label: "5 sumber", value: 5 },
                    { label: "10 sumber", value: 10 },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={isAsking}
              block
            >
              {isAsking ? "Sedang berpikir..." : "Tanya AI"}
            </Button>
          </Form.Item>
        </Form>

        {/* AI Response */}
        {isAsking && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: "#999" }}>
              AI sedang mencari jawaban...
            </p>
          </div>
        )}

        {aiResponse && !isAsking && (
          <Stack spacing="md" style={{ marginTop: 24 }}>
            <Paper p="md" withBorder>
              <Group position="apart" mb="xs">
                <Text size="sm" weight={600}>
                  Jawaban AI:
                </Text>
                <Badge color="blue" variant="light">
                  {aiResponse.search_method || "hybrid"}
                </Badge>
              </Group>
              <ReactMarkdownCustom>{aiResponse.answer}</ReactMarkdownCustom>
            </Paper>

            {aiResponse.sources && aiResponse.sources.length > 0 && (
              <Box>
                <Text size="sm" weight={600} mb="xs">
                  Sumber ({aiResponse.sources.length}):
                </Text>
                <Stack spacing="xs">
                  {aiResponse.sources.map((source, idx) => (
                    <Paper key={idx} p="sm" withBorder>
                      <Group position="apart" mb={4}>
                        <Text size="xs" weight={500}>
                          FAQ #{source.id}
                        </Text>
                        {source.similarity && (
                          <Badge size="sm" color="green" variant="outline">
                            {(source.similarity * 100).toFixed(1)}%
                          </Badge>
                        )}
                      </Group>
                      <Text size="xs" color="dimmed">
                        {source.question}
                      </Text>
                      {source.sub_categories && (
                        <Group spacing={4} mt={4}>
                          {source.sub_categories.map((cat, i) => (
                            <Badge key={i} size="xs" variant="dot">
                              {cat}
                            </Badge>
                          ))}
                        </Group>
                      )}
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </Modal>
    </>
  );
}

export default FaqQnaActions;

