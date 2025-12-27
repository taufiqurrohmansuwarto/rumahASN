import LayoutRasnNaskah from "@/components/RasnNaskah/LayoutRasnNaskah";
import PageContainer from "@/components/PageContainer";
import {
  useRasnNaskahPreferences,
  useRasnNaskahLanguageStyles,
} from "@/hooks/useRasnNaskah";
import {
  updatePreferences,
  addCustomRule,
  deleteCustomRule,
  addForbiddenWord,
  deleteForbiddenWord,
  addPreferredTerm,
  deletePreferredTerm,
} from "@/services/rasn-naskah.services";
import {
  IconAlertCircle,
  IconCheck,
  IconLanguage,
  IconPlus,
  IconSettings,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  List,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Tabs,
  Tag,
  Typography,
} from "antd";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const RasnNaskahPreferences = () => {
  const queryClient = useQueryClient();
  const [customRuleForm] = Form.useForm();
  const [forbiddenWordForm] = Form.useForm();
  const [preferredTermForm] = Form.useForm();

  const { data: preferences, isLoading } = useRasnNaskahPreferences();
  const { data: languageStyles } = useRasnNaskahLanguageStyles();

  // Mutations
  const updatePrefMutation = useMutation({
    mutationFn: (data) => updatePreferences(data),
    onSuccess: () => {
      message.success("Preferensi berhasil diperbarui");
      queryClient.invalidateQueries(["rasn-naskah-preferences"]);
    },
    onError: () => {
      message.error("Gagal memperbarui preferensi");
    },
  });

  const addCustomRuleMutation = useMutation({
    mutationFn: (data) => addCustomRule(data),
    onSuccess: () => {
      message.success("Aturan kustom berhasil ditambahkan");
      queryClient.invalidateQueries(["rasn-naskah-preferences"]);
      customRuleForm.resetFields();
    },
    onError: () => {
      message.error("Gagal menambahkan aturan");
    },
  });

  const deleteCustomRuleMutation = useMutation({
    mutationFn: (ruleId) => deleteCustomRule(ruleId),
    onSuccess: () => {
      message.success("Aturan berhasil dihapus");
      queryClient.invalidateQueries(["rasn-naskah-preferences"]);
    },
    onError: () => {
      message.error("Gagal menghapus aturan");
    },
  });

  const addForbiddenWordMutation = useMutation({
    mutationFn: (data) => addForbiddenWord(data),
    onSuccess: () => {
      message.success("Kata terlarang berhasil ditambahkan");
      queryClient.invalidateQueries(["rasn-naskah-preferences"]);
      forbiddenWordForm.resetFields();
    },
    onError: () => {
      message.error("Gagal menambahkan kata");
    },
  });

  const deleteForbiddenWordMutation = useMutation({
    mutationFn: (wordId) => deleteForbiddenWord(wordId),
    onSuccess: () => {
      message.success("Kata berhasil dihapus");
      queryClient.invalidateQueries(["rasn-naskah-preferences"]);
    },
    onError: () => {
      message.error("Gagal menghapus kata");
    },
  });

  const addPreferredTermMutation = useMutation({
    mutationFn: (data) => addPreferredTerm(data),
    onSuccess: () => {
      message.success("Istilah preferensi berhasil ditambahkan");
      queryClient.invalidateQueries(["rasn-naskah-preferences"]);
      preferredTermForm.resetFields();
    },
    onError: () => {
      message.error("Gagal menambahkan istilah");
    },
  });

  const deletePreferredTermMutation = useMutation({
    mutationFn: (termId) => deletePreferredTerm(termId),
    onSuccess: () => {
      message.success("Istilah berhasil dihapus");
      queryClient.invalidateQueries(["rasn-naskah-preferences"]);
    },
    onError: () => {
      message.error("Gagal menghapus istilah");
    },
  });

  const handleUpdateSettings = (key, value) => {
    updatePrefMutation.mutate({ [key]: value });
  };

  const tabItems = [
    {
      key: "general",
      label: (
        <Space>
          <IconSettings size={16} />
          Umum
        </Space>
      ),
      children: (
        <Card>
          <Form layout="vertical">
            <Form.Item label="Gaya Bahasa Default">
              <Select
                value={preferences?.language_style || "formal"}
                onChange={(value) =>
                  handleUpdateSettings("default_language_style", value)
                }
                style={{ width: 300 }}
                options={
                  languageStyles?.map?.((style) => ({
                    value: style.key,
                    label: style.label,
                  })) || [
                    { value: "formal", label: "Formal" },
                    { value: "semi_formal", label: "Semi Formal" },
                    { value: "informal", label: "Informal" },
                  ]
                }
              />
            </Form.Item>

            <Divider />

            <Form.Item label="Notifikasi">
              <Space direction="vertical">
                <Space>
                  <Switch
                    checked={preferences?.email_notification !== false}
                    onChange={(checked) =>
                      handleUpdateSettings("email_notification", checked)
                    }
                  />
                  <Text>Terima notifikasi email saat review selesai</Text>
                </Space>
                <Space>
                  <Switch
                    checked={preferences?.auto_review !== false}
                    onChange={(checked) =>
                      handleUpdateSettings("auto_review", checked)
                    }
                  />
                  <Text>Otomatis review saat upload dokumen</Text>
                </Space>
              </Space>
            </Form.Item>

            <Divider />

            <Form.Item label="Tingkat Keketatan Review">
              <Select
                value={preferences?.strictness_level || "medium"}
                onChange={(value) =>
                  handleUpdateSettings("strictness_level", value)
                }
                style={{ width: 300 }}
                options={[
                  { value: "low", label: "Rendah - Toleransi tinggi" },
                  { value: "medium", label: "Sedang - Seimbang" },
                  { value: "high", label: "Tinggi - Ketat" },
                ]}
              />
              <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 12 }}>
                Tingkat keketatan mempengaruhi sensitivitas AI dalam mendeteksi
                kesalahan.
              </Paragraph>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: "custom-rules",
      label: (
        <Space>
          <IconAlertCircle size={16} />
          Aturan Kustom
        </Space>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Tambah Aturan Baru">
              <Form
                form={customRuleForm}
                layout="vertical"
                onFinish={(values) => addCustomRuleMutation.mutate(values)}
              >
                <Form.Item
                  name="name"
                  label="Nama Aturan"
                  rules={[{ required: true, message: "Nama aturan wajib diisi" }]}
                >
                  <Input placeholder="Contoh: Gunakan kalimat aktif" />
                </Form.Item>
                <Form.Item
                  name="description"
                  label="Deskripsi"
                  rules={[{ required: true, message: "Deskripsi wajib diisi" }]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Jelaskan aturan ini secara detail..."
                  />
                </Form.Item>
                <Form.Item
                  name="severity"
                  label="Tingkat Keparahan"
                  initialValue="warning"
                >
                  <Select
                    options={[
                      { value: "info", label: "Info" },
                      { value: "warning", label: "Peringatan" },
                      { value: "error", label: "Error" },
                    ]}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<IconPlus size={16} />}
                    loading={addCustomRuleMutation.isLoading}
                  >
                    Tambah Aturan
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Aturan Kustom Anda">
              <List
                dataSource={preferences?.custom_rules || []}
                locale={{ emptyText: "Belum ada aturan kustom" }}
                renderItem={(rule) => (
                  <List.Item
                    actions={[
                      <Popconfirm
                        key="delete"
                        title="Hapus aturan ini?"
                        onConfirm={() => deleteCustomRuleMutation.mutate(rule.id)}
                        okText="Ya"
                        cancelText="Tidak"
                      >
                        <Button
                          type="text"
                          danger
                          icon={<IconTrash size={16} />}
                          loading={deleteCustomRuleMutation.isLoading}
                        />
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          {rule.name}
                          <Tag
                            color={
                              rule.severity === "error"
                                ? "red"
                                : rule.severity === "warning"
                                ? "orange"
                                : "blue"
                            }
                          >
                            {rule.severity}
                          </Tag>
                        </Space>
                      }
                      description={rule.description}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "forbidden-words",
      label: (
        <Space>
          <IconX size={16} />
          Kata Terlarang
        </Space>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Tambah Kata Terlarang">
              <Form
                form={forbiddenWordForm}
                layout="vertical"
                onFinish={(values) => addForbiddenWordMutation.mutate(values)}
              >
                <Form.Item
                  name="word"
                  label="Kata/Frasa"
                  rules={[{ required: true, message: "Kata wajib diisi" }]}
                >
                  <Input placeholder="Kata yang ingin dihindari" />
                </Form.Item>
                <Form.Item name="replacement" label="Pengganti (Opsional)">
                  <Input placeholder="Kata pengganti yang disarankan" />
                </Form.Item>
                <Form.Item name="reason" label="Alasan (Opsional)">
                  <Input placeholder="Mengapa kata ini harus dihindari?" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<IconPlus size={16} />}
                    loading={addForbiddenWordMutation.isLoading}
                  >
                    Tambah
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Daftar Kata Terlarang">
              <List
                dataSource={preferences?.forbidden_words || []}
                locale={{ emptyText: "Belum ada kata terlarang" }}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Popconfirm
                        key="delete"
                        title="Hapus kata ini?"
                        onConfirm={() =>
                          deleteForbiddenWordMutation.mutate(item.id)
                        }
                        okText="Ya"
                        cancelText="Tidak"
                      >
                        <Button
                          type="text"
                          danger
                          icon={<IconTrash size={16} />}
                          loading={deleteForbiddenWordMutation.isLoading}
                        />
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag color="red">{item.word}</Tag>
                          {item.replacement && (
                            <>
                              <Text type="secondary">→</Text>
                              <Tag color="green">{item.replacement}</Tag>
                            </>
                          )}
                        </Space>
                      }
                      description={item.reason}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "preferred-terms",
      label: (
        <Space>
          <IconCheck size={16} />
          Istilah Preferensi
        </Space>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Tambah Istilah Preferensi">
              <Form
                form={preferredTermForm}
                layout="vertical"
                onFinish={(values) => addPreferredTermMutation.mutate(values)}
              >
                <Form.Item
                  name="original"
                  label="Istilah Asli"
                  rules={[{ required: true, message: "Istilah asli wajib diisi" }]}
                >
                  <Input placeholder="Istilah yang sering salah digunakan" />
                </Form.Item>
                <Form.Item
                  name="preferred"
                  label="Istilah yang Benar"
                  rules={[{ required: true, message: "Istilah benar wajib diisi" }]}
                >
                  <Input placeholder="Istilah yang seharusnya digunakan" />
                </Form.Item>
                <Form.Item name="context" label="Konteks (Opsional)">
                  <Input placeholder="Kapan aturan ini berlaku?" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<IconPlus size={16} />}
                    loading={addPreferredTermMutation.isLoading}
                  >
                    Tambah
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Daftar Istilah Preferensi">
              <List
                dataSource={preferences?.preferred_terms || []}
                locale={{ emptyText: "Belum ada istilah preferensi" }}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Popconfirm
                        key="delete"
                        title="Hapus istilah ini?"
                        onConfirm={() =>
                          deletePreferredTermMutation.mutate(item.id)
                        }
                        okText="Ya"
                        cancelText="Tidak"
                      >
                        <Button
                          type="text"
                          danger
                          icon={<IconTrash size={16} />}
                          loading={deletePreferredTermMutation.isLoading}
                        />
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag>{item.original}</Tag>
                          <Text type="secondary">→</Text>
                          <Tag color="blue">{item.preferred}</Tag>
                        </Space>
                      }
                      description={item.context}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>SAKTI Naskah - Preferensi</title>
      </Head>
      <PageContainer
        title="Preferensi Review"
        subTitle="Sesuaikan pengaturan review dokumen Anda"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/rasn-naskah">SAKTI Naskah</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Preferensi</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <Spin spinning={isLoading}>
          <Tabs items={tabItems} defaultActiveKey="general" />
        </Spin>
      </PageContainer>
    </>
  );
};

RasnNaskahPreferences.getLayout = function getLayout(page) {
  return (
    <LayoutRasnNaskah active="/rasn-naskah/preferences">{page}</LayoutRasnNaskah>
  );
};

RasnNaskahPreferences.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RasnNaskahPreferences;
