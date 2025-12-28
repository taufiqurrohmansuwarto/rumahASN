import LayoutRasnNaskah from "@/components/RasnNaskah/LayoutRasnNaskah";
import PageContainer from "@/components/PageContainer";
import {
  createDocument,
  generateDocument,
} from "@/services/rasn-naskah.services";
import { Stack, Text, Group } from "@mantine/core";
import {
  IconFileText,
  IconUser,
  IconMessage,
  IconSparkles,
  IconDeviceFloppy,
  IconRefresh,
  IconCopy,
} from "@tabler/icons-react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Skeleton,
} from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const { TextArea } = Input;

// Document types
const DOCUMENT_TYPES = [
  { value: "nota_dinas", label: "Nota Dinas" },
  { value: "surat_dinas", label: "Surat Dinas" },
  { value: "undangan", label: "Undangan" },
  { value: "surat_tugas", label: "Surat Tugas" },
  { value: "pengumuman", label: "Pengumuman" },
  { value: "surat_edaran", label: "Surat Edaran" },
  { value: "laporan", label: "Laporan" },
];

// Form Field Component
const FormField = ({ icon: Icon, label, children }) => (
  <Group gap={8} align="flex-start" mb={16} wrap="nowrap">
    {Icon && (
      <div style={{ marginTop: 8 }}>
        <Icon size={16} color="#6b7280" />
      </div>
    )}
    <div style={{ flex: 1 }}>
      <Text size="xs" c="dimmed" mb={4}>
        {label}
      </Text>
      {children}
    </div>
  </Group>
);

const GenerateDocumentCreate = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [generatedData, setGeneratedData] = useState(null);

  // Generate AI mutation
  const generateMutation = useMutation({
    mutationFn: (data) => generateDocument(data),
    onSuccess: (response) => {
      const data = response?.data || response;
      setGeneratedData({
        content: data.content,
        search_queries: data.search_queries || [],
      });
      message.success("Naskah berhasil digenerate");
    },
    onError: (error) => {
      message.error(
        error?.response?.data?.message || "Gagal generate naskah"
      );
    },
  });

  // Create document mutation
  const createMutation = useMutation({
    mutationFn: (data) => createDocument(data),
    onSuccess: (response) => {
      message.success("Dokumen berhasil disimpan");
      queryClient.invalidateQueries(["generate-documents"]);
      router.push(`/rasn-naskah/generate-document/${response?.data?.id || response?.id}`);
    },
    onError: (error) => {
      message.error(
        error?.response?.data?.message || "Gagal menyimpan dokumen"
      );
    },
  });

  const handleGenerate = async () => {
    try {
      const values = await form.validateFields();
      generateMutation.mutate({
        document_type: values.document_type,
        recipient: values.recipient,
        description: values.description,
      });
    } catch (error) {
      // Validation error
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      createMutation.mutate({
        title: `${DOCUMENT_TYPES.find((t) => t.value === values.document_type)?.label || "Dokumen"} - ${values.recipient?.slice(0, 30)}`,
        document_type: values.document_type,
        content: generatedData?.content,
        description: values.description,
        recipient: values.recipient,
        source_type: "ai_generated",
      });
    } catch (error) {
      // Validation error
    }
  };

  const handleReset = () => {
    form.resetFields();
    setGeneratedData(null);
  };

  const handleCopy = () => {
    if (generatedData?.content) {
      navigator.clipboard.writeText(generatedData.content);
      message.success("Isi naskah disalin!");
    }
  };

  return (
    <>
      <Head>
        <title>SAKTI Naskah - Buat Naskah Baru</title>
      </Head>
      <PageContainer
        onBack={() => router.back()}
        title="Buat Naskah Baru"
        subTitle="Generate isi naskah dinas dengan AI"
        breadcrumb={{
          items: [
            { title: "SAKTI Naskah", path: "/rasn-naskah" },
            { title: "Generate AI", path: "/rasn-naskah/generate-document" },
            { title: "Buat Baru" },
          ],
        }}
      >
        <Card size="small" styles={{ body: { padding: 24 } }}>
          {/* Form Section */}
          {!generatedData && !generateMutation.isLoading && (
            <Form form={form} layout="vertical" requiredMark={false}>
              <Row gutter={[24, 0]}>
                {/* Document Type */}
                <Col xs={24} md={8}>
                  <FormField icon={IconFileText} label="Jenis:">
                    <Form.Item
                      name="document_type"
                      rules={[{ required: true, message: "Pilih jenis naskah" }]}
                      noStyle
                    >
                      <Select
                        placeholder="Pilih jenis naskah"
                        options={DOCUMENT_TYPES}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </FormField>
                </Col>

                {/* Recipient */}
                <Col xs={24} md={16}>
                  <FormField icon={IconUser} label="Kepada:">
                    <Form.Item
                      name="recipient"
                      rules={[{ required: true, message: "Isi tujuan naskah" }]}
                      noStyle
                    >
                      <Input placeholder="Contoh: Seluruh Perangkat Daerah Provinsi Jawa Timur" />
                    </Form.Item>
                  </FormField>
                </Col>

                {/* Description */}
                <Col xs={24}>
                  <FormField icon={IconMessage} label="Apa yang ingin disampaikan?">
                    <Form.Item
                      name="description"
                      rules={[
                        { required: true, message: "Isi deskripsi pesan" },
                        { min: 10, message: "Minimal 10 karakter" },
                      ]}
                      noStyle
                    >
                      <TextArea
                        rows={4}
                        placeholder="Contoh: undangan zoom jam 11 untuk penyelesaian disparitas data, minta pengelola kepegawaian hadir"
                        style={{ resize: "none" }}
                      />
                    </Form.Item>
                  </FormField>
                </Col>

                {/* Generate Button */}
                <Col xs={24}>
                  <Button
                    type="primary"
                    icon={<IconSparkles size={16} />}
                    onClick={handleGenerate}
                    loading={generateMutation.isLoading}
                    size="large"
                    style={{ marginTop: 8 }}
                  >
                    Generate AI
                  </Button>
                </Col>
              </Row>
            </Form>
          )}

          {/* Loading State */}
          {generateMutation.isLoading && (
            <div style={{ padding: "20px 0" }}>
              <Stack gap={12}>
                <Text size="sm" c="dimmed">Mencari format di Pergub Jatim...</Text>
                <Skeleton active paragraph={{ rows: 2 }} />
                <Text size="sm" c="dimmed">Menyusun naskah sesuai panduan...</Text>
                <Skeleton active paragraph={{ rows: 6 }} />
              </Stack>
            </div>
          )}

          {/* Result Section */}
          {generatedData && !generateMutation.isLoading && (
            <Stack gap={16}>
              {/* Header with actions */}
              <Group justify="space-between" align="center" wrap="wrap">
                <Group gap={8}>
                  <Text size="sm" fw={600} c="#fa8c16">
                    Hasil AI
                  </Text>
                  {generatedData.search_queries?.length > 0 && (
                    <Text size="xs" c="dimmed">
                      ({generatedData.search_queries.length} referensi)
                    </Text>
                  )}
                </Group>
                <Group gap={8}>
                  <Button
                    icon={<IconRefresh size={16} />}
                    onClick={handleReset}
                  >
                    Ulang
                  </Button>
                  <Button
                    icon={<IconCopy size={16} />}
                    onClick={handleCopy}
                  >
                    Salin
                  </Button>
                  <Button
                    type="primary"
                    icon={<IconDeviceFloppy size={16} />}
                    onClick={handleSave}
                    loading={createMutation.isLoading}
                  >
                    Simpan
                  </Button>
                </Group>
              </Group>

              {/* Content Display */}
              <div
                style={{
                  background: "#fafafa",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: 24,
                  minHeight: 300,
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  fontSize: 14,
                  lineHeight: 1.8,
                }}
              >
                {generatedData.content}
              </div>
            </Stack>
          )}
        </Card>
      </PageContainer>
    </>
  );
};

GenerateDocumentCreate.getLayout = function getLayout(page) {
  return (
    <LayoutRasnNaskah active="/rasn-naskah/generate-document">
      {page}
    </LayoutRasnNaskah>
  );
};

GenerateDocumentCreate.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default GenerateDocumentCreate;
