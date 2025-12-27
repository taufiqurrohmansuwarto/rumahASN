import LayoutRasnNaskah from "@/components/RasnNaskah/LayoutRasnNaskah";
import PageContainer from "@/components/PageContainer";
import { useRasnNaskahTemplateDetail } from "@/hooks/useRasnNaskah";
import {
  IconArrowLeft,
  IconCopy,
  IconDownload,
  IconTemplate,
} from "@tabler/icons-react";
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Descriptions,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { duplicateTemplate } from "@/services/rasn-naskah.services";

const { Title, Paragraph, Text } = Typography;

const RasnNaskahTemplateDetail = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const queryClient = useQueryClient();

  const { data: template, isLoading } = useRasnNaskahTemplateDetail(templateId);

  const duplicateMutation = useMutation({
    mutationFn: () => duplicateTemplate(templateId),
    onSuccess: (response) => {
      message.success("Template berhasil diduplikasi");
      queryClient.invalidateQueries(["rasn-naskah-templates"]);
      router.push(`/rasn-naskah/documents/${response.data.id}/edit`);
    },
    onError: () => {
      message.error("Gagal menduplikasi template");
    },
  });

  const getCategoryColor = (cat) => {
    const colors = {
      surat_dinas: "blue",
      nota_dinas: "green",
      surat_keputusan: "purple",
      surat_edaran: "orange",
      pengumuman: "cyan",
      laporan: "magenta",
    };
    return colors[cat] || "default";
  };

  return (
    <>
      <Head>
        <title>
          SAKTI Naskah - {template?.data?.name || "Detail Template"}
        </title>
      </Head>
      <PageContainer
        title={template?.data?.name || "Detail Template"}
        subTitle="Preview dan gunakan template ini"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/rasn-naskah">SAKTI Naskah</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/rasn-naskah/templates">Template</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{template?.data?.name || "Detail"}</Breadcrumb.Item>
          </Breadcrumb>
        )}
        extra={[
          <Button
            key="back"
            icon={<IconArrowLeft size={16} />}
            onClick={() => router.push("/rasn-naskah/templates")}
          >
            Kembali
          </Button>,
          <Button
            key="use"
            type="primary"
            icon={<IconCopy size={16} />}
            onClick={() => duplicateMutation.mutate()}
            loading={duplicateMutation.isLoading}
          >
            Gunakan Template
          </Button>,
        ]}
      >
        <Spin spinning={isLoading}>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              {/* Template Preview */}
              <Card
                title={
                  <Space>
                    <IconTemplate size={18} />
                    Preview Template
                  </Space>
                }
              >
                <div
                  style={{
                    padding: "24px",
                    backgroundColor: "#fafafa",
                    borderRadius: 8,
                    minHeight: 400,
                    whiteSpace: "pre-wrap",
                    fontFamily: "monospace",
                    fontSize: 13,
                    lineHeight: 1.8,
                  }}
                >
                  {template?.data?.content || "Tidak ada konten template"}
                </div>
              </Card>

              {/* Structure Guidelines */}
              {template?.data?.structure_guidelines && (
                <Card
                  title="Panduan Struktur"
                  style={{ marginTop: 16 }}
                >
                  <Paragraph>
                    {template.data.structure_guidelines}
                  </Paragraph>
                </Card>
              )}
            </Col>

            <Col xs={24} lg={8}>
              {/* Template Info */}
              <Card title="Informasi Template">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Nama">
                    {template?.data?.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Kategori">
                    <Tag color={getCategoryColor(template?.data?.category)}>
                      {template?.data?.category_label || template?.data?.category}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    {template?.data?.is_active ? (
                      <Tag color="green">Aktif</Tag>
                    ) : (
                      <Tag color="red">Nonaktif</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Resmi">
                    {template?.data?.is_official ? (
                      <Tag color="gold">Template Resmi</Tag>
                    ) : (
                      <Tag>Template User</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Dibuat">
                    {template?.data?.created_at
                      ? dayjs(template.data.created_at).format("DD MMM YYYY")
                      : "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Diperbarui">
                    {template?.data?.updated_at
                      ? dayjs(template.data.updated_at).format("DD MMM YYYY")
                      : "-"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Description */}
              {template?.data?.description && (
                <Card title="Deskripsi" style={{ marginTop: 16 }}>
                  <Paragraph>{template.data.description}</Paragraph>
                </Card>
              )}

              {/* Placeholders */}
              {template?.data?.placeholders?.length > 0 && (
                <Card title="Placeholder" style={{ marginTop: 16 }}>
                  <Space wrap>
                    {template.data.placeholders.map((placeholder, index) => (
                      <Tag key={index} color="blue">
                        {`{{${placeholder}}}`}
                      </Tag>
                    ))}
                  </Space>
                  <Paragraph
                    type="secondary"
                    style={{ marginTop: 8, fontSize: 12 }}
                  >
                    Placeholder akan diganti dengan nilai yang sesuai saat
                    menggunakan template.
                  </Paragraph>
                </Card>
              )}
            </Col>
          </Row>
        </Spin>
      </PageContainer>
    </>
  );
};

RasnNaskahTemplateDetail.getLayout = function getLayout(page) {
  return (
    <LayoutRasnNaskah active="/rasn-naskah/templates">{page}</LayoutRasnNaskah>
  );
};

RasnNaskahTemplateDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RasnNaskahTemplateDetail;
