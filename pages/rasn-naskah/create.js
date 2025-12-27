import LayoutRasnNaskah from "@/components/RasnNaskah/LayoutRasnNaskah";
import PageContainer from "@/components/PageContainer";
import { useRasnNaskahTemplates } from "@/hooks/useRasnNaskah";
import { createDocument } from "@/services/rasn-naskah.services";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconFileText,
  IconTemplate,
} from "@tabler/icons-react";
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
  Steps,
  Typography,
} from "antd";
import dayjs from "dayjs";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const RasnNaskahCreate = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const { data: templates } = useRasnNaskahTemplates({ limit: 100 });

  const createMutation = useMutation({
    mutationFn: (data) => createDocument(data),
    onSuccess: (response) => {
      message.success("Dokumen berhasil dibuat");
      queryClient.invalidateQueries(["rasn-naskah-documents"]);
      router.push(`/rasn-naskah/documents/${response.data.id}`);
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || "Gagal membuat dokumen");
    },
  });

  const documentTypes = [
    { value: "surat_dinas", label: "Surat Dinas" },
    { value: "nota_dinas", label: "Nota Dinas" },
    { value: "surat_keputusan", label: "Surat Keputusan" },
    { value: "surat_edaran", label: "Surat Edaran" },
    { value: "pengumuman", label: "Pengumuman" },
    { value: "laporan", label: "Laporan" },
    { value: "other", label: "Lainnya" },
  ];

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    form.setFieldsValue({
      document_type: template.category,
      content: template.content,
    });
    setCurrentStep(1);
  };

  const handleSkipTemplate = () => {
    setSelectedTemplate(null);
    setCurrentStep(1);
  };

  const handleSubmit = (values) => {
    const data = {
      ...values,
      document_date: values.document_date
        ? dayjs(values.document_date).format("YYYY-MM-DD")
        : null,
      template_id: selectedTemplate?.id || null,
    };
    createMutation.mutate(data);
  };

  const steps = [
    {
      title: "Pilih Template",
      description: "Opsional",
    },
    {
      title: "Isi Detail",
      description: "Informasi dokumen",
    },
    {
      title: "Konten",
      description: "Tulis konten",
    },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Title level={4}>Pilih Template Dokumen</Title>
              <Paragraph type="secondary">
                Mulai dengan template atau buat dari awal
              </Paragraph>
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  onClick={handleSkipTemplate}
                  style={{
                    textAlign: "center",
                    minHeight: 150,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <IconFileText size={48} style={{ color: "#1890ff" }} />
                  <Title level={5} style={{ marginTop: 12, marginBottom: 0 }}>
                    Dokumen Kosong
                  </Title>
                  <Text type="secondary">Mulai dari awal</Text>
                </Card>
              </Col>

              {templates?.data?.slice(0, 7).map((template) => (
                <Col xs={24} sm={12} md={8} lg={6} key={template.id}>
                  <Card
                    hoverable
                    onClick={() => handleSelectTemplate(template)}
                    style={{
                      textAlign: "center",
                      minHeight: 150,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <IconTemplate size={48} style={{ color: "#722ed1" }} />
                    <Title level={5} style={{ marginTop: 12, marginBottom: 0 }}>
                      {template.name}
                    </Title>
                    <Text type="secondary" ellipsis>
                      {template.category_label || template.category}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Button
                type="link"
                onClick={() => router.push("/rasn-naskah/templates")}
              >
                Lihat Semua Template →
              </Button>
            </div>
          </Card>
        );

      case 1:
        return (
          <Card>
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                document_type: "surat_dinas",
              }}
            >
              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="title"
                    label="Judul Dokumen"
                    rules={[
                      { required: true, message: "Judul dokumen wajib diisi" },
                    ]}
                  >
                    <Input placeholder="Masukkan judul dokumen" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="document_type"
                    label="Jenis Dokumen"
                    rules={[
                      { required: true, message: "Jenis dokumen wajib dipilih" },
                    ]}
                  >
                    <Select options={documentTypes} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name="document_number" label="Nomor Dokumen">
                    <Input placeholder="Contoh: 001/SKT/BKD/2024" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="document_date" label="Tanggal Dokumen">
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD MMMM YYYY"
                      placeholder="Pilih tanggal"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="Deskripsi (Opsional)">
                <TextArea
                  rows={2}
                  placeholder="Deskripsi singkat tentang dokumen ini"
                />
              </Form.Item>
            </Form>

            <div style={{ textAlign: "right", marginTop: 24 }}>
              <Space>
                <Button onClick={() => setCurrentStep(0)}>Kembali</Button>
                <Button type="primary" onClick={() => setCurrentStep(2)}>
                  Lanjut
                </Button>
              </Space>
            </div>
          </Card>
        );

      case 2:
        return (
          <Card>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="content"
                label="Konten Dokumen"
                rules={[
                  { required: true, message: "Konten dokumen wajib diisi" },
                ]}
              >
                <TextArea
                  rows={20}
                  placeholder="Tulis konten dokumen Anda di sini..."
                  style={{
                    fontFamily: "'Times New Roman', serif",
                    fontSize: 14,
                    lineHeight: 1.8,
                  }}
                />
              </Form.Item>

              <div style={{ textAlign: "right" }}>
                <Space>
                  <Button onClick={() => setCurrentStep(1)}>Kembali</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<IconDeviceFloppy size={16} />}
                    loading={createMutation.isLoading}
                  >
                    Simpan Dokumen
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>SAKTI Naskah - Buat Dokumen Baru</title>
      </Head>
      <PageContainer
        title="Buat Dokumen Baru"
        subTitle="Buat dokumen naskah dinas baru"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/rasn-naskah">SAKTI Naskah</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Buat Baru</Breadcrumb.Item>
          </Breadcrumb>
        )}
        extra={[
          <Button
            key="back"
            icon={<IconArrowLeft size={16} />}
            onClick={() => router.push("/rasn-naskah")}
          >
            Kembali
          </Button>,
        ]}
      >
        <Steps
          current={currentStep}
          items={steps}
          style={{ marginBottom: 32 }}
        />

        {renderStepContent()}
      </PageContainer>
    </>
  );
};

RasnNaskahCreate.getLayout = function getLayout(page) {
  return (
    <LayoutRasnNaskah active="/rasn-naskah/create">{page}</LayoutRasnNaskah>
  );
};

RasnNaskahCreate.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RasnNaskahCreate;
