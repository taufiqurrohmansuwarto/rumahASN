import LayoutRasnNaskah from "@/components/RasnNaskah/LayoutRasnNaskah";
import PageContainer from "@/components/PageContainer";
import {
  useRasnNaskahTemplates,
  useRasnNaskahTemplateCategories,
} from "@/hooks/useRasnNaskah";
import {
  IconCopy,
  IconDownload,
  IconEye,
  IconFilter,
  IconSearch,
  IconTemplate,
} from "@tabler/icons-react";
import {
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Col,
  Empty,
  Input,
  List,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { duplicateTemplate } from "@/services/rasn-naskah.services";

const { Text, Paragraph } = Typography;

const RasnNaskahTemplates = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const { data: templates, isLoading } = useRasnNaskahTemplates({
    search,
    category,
  });
  const { data: categories } = useRasnNaskahTemplateCategories();

  const duplicateMutation = useMutation({
    mutationFn: (templateId) => duplicateTemplate(templateId),
    onSuccess: (response) => {
      message.success("Template berhasil diduplikasi");
      queryClient.invalidateQueries(["rasn-naskah-templates"]);
      router.push(`/rasn-naskah/templates/${response.data.id}`);
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
        <title>SAKTI Naskah - Template</title>
      </Head>
      <PageContainer
        title="Template Dokumen"
        subTitle="Pilih template untuk membuat dokumen baru"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/rasn-naskah">SAKTI Naskah</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Template</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        {/* Filters */}
        <Card style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="Cari template..."
              prefix={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              value={category}
              onChange={setCategory}
              style={{ width: 180 }}
              placeholder="Semua Kategori"
              allowClear
              options={[
                { value: "", label: "Semua Kategori" },
                ...(categories?.data?.map((cat) => ({
                  value: cat.category,
                  label: cat.category_label,
                })) || []),
              ]}
              suffixIcon={<IconFilter size={14} />}
            />
          </Space>
        </Card>

        {/* Templates Grid */}
        <Spin spinning={isLoading}>
          {templates?.data?.length > 0 ? (
            <Row gutter={[16, 16]}>
              {templates.data.map((template) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={template.id}>
                  <Card
                    hoverable
                    actions={[
                      <Button
                        key="preview"
                        type="text"
                        icon={<IconEye size={16} />}
                        onClick={() =>
                          router.push(`/rasn-naskah/templates/${template.id}`)
                        }
                      >
                        Preview
                      </Button>,
                      <Button
                        key="use"
                        type="text"
                        icon={<IconCopy size={16} />}
                        onClick={() => duplicateMutation.mutate(template.id)}
                        loading={duplicateMutation.isLoading}
                      >
                        Gunakan
                      </Button>,
                    ]}
                  >
                    <Card.Meta
                      avatar={
                        <Avatar
                          style={{ backgroundColor: "#1890ff" }}
                          icon={<IconTemplate size={20} />}
                        />
                      }
                      title={
                        <Space direction="vertical" size={0}>
                          <Text strong ellipsis>
                            {template.name}
                          </Text>
                          <Tag color={getCategoryColor(template.category)}>
                            {template.category_label || template.category}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          type="secondary"
                          style={{ marginBottom: 0, fontSize: 12 }}
                        >
                          {template.description || "Tidak ada deskripsi"}
                        </Paragraph>
                      }
                    />
                    {template.is_official && (
                      <Tag
                        color="gold"
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                        }}
                      >
                        Resmi
                      </Tag>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Card>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  search || category
                    ? "Tidak ada template yang sesuai dengan filter"
                    : "Belum ada template tersedia"
                }
              />
            </Card>
          )}
        </Spin>
      </PageContainer>
    </>
  );
};

RasnNaskahTemplates.getLayout = function getLayout(page) {
  return (
    <LayoutRasnNaskah active="/rasn-naskah/templates">{page}</LayoutRasnNaskah>
  );
};

RasnNaskahTemplates.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RasnNaskahTemplates;
