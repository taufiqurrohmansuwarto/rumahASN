import LayoutRasnNaskah from "@/components/RasnNaskah/LayoutRasnNaskah";
import PageContainer from "@/components/PageContainer";
import { getDocuments, deleteDocument } from "@/services/rasn-naskah.services";
import { Stack, Text, Group } from "@mantine/core";
import {
  IconPlus,
  IconFileText,
  IconEye,
  IconEdit,
  IconTrash,
  IconCopy,
} from "@tabler/icons-react";
import {
  Button,
  Card,
  Empty,
  Input,
  message,
  Popconfirm,
  Space,
  Table,
  Tag,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

dayjs.extend(relativeTime);
dayjs.locale("id");

const categoryLabels = {
  nota_dinas: "Nota Dinas",
  surat_dinas: "Surat Dinas",
  undangan: "Undangan",
  surat_tugas: "Surat Tugas",
  pengumuman: "Pengumuman",
  surat_edaran: "Surat Edaran",
  laporan: "Laporan",
};

const GenerateDocumentIndex = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // Get AI generated documents
  const { data, isLoading } = useQuery(
    ["generate-documents", search],
    () => getDocuments({ source_type: "ai_generated", search }),
    { keepPreviousData: true }
  );

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDocument(id),
    onSuccess: () => {
      message.success("Dokumen berhasil dihapus");
      queryClient.invalidateQueries(["generate-documents"]);
    },
    onError: () => {
      message.error("Gagal menghapus dokumen");
    },
  });

  const handleCopy = (content) => {
    if (content) {
      navigator.clipboard.writeText(content);
      message.success("Konten disalin!");
    }
  };

  const columns = [
    {
      title: "Dokumen",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <Space direction="vertical" size={0}>
          <Text
            fw={500}
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`/rasn-naskah/generate-document/${record.id}`)}
          >
            {title}
          </Text>
          <Space size={4}>
            {record.category && (
              <Tag size="small">
                {categoryLabels[record.category] || record.category}
              </Tag>
            )}
            <Text c="dimmed" size="xs">
              {dayjs(record.created_at).fromNow()}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space size={4}>
          <Button
            size="small"
            icon={<IconEye size={14} />}
            onClick={() => router.push(`/rasn-naskah/generate-document/${record.id}`)}
          >
            Lihat
          </Button>
          <Button
            size="small"
            icon={<IconEdit size={14} />}
            onClick={() => router.push(`/rasn-naskah/generate-document/${record.id}?edit=true`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Hapus dokumen ini?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Ya"
            cancelText="Batal"
          >
            <Button
              size="small"
              danger
              icon={<IconTrash size={14} />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>SAKTI Naskah - Generate AI</title>
      </Head>
      <PageContainer
        title="Generate AI"
        subTitle="Buat naskah dinas dengan bantuan AI"
        breadcrumb={{
          items: [
            { title: "SAKTI Naskah", path: "/rasn-naskah" },
            { title: "Generate AI" },
          ],
        }}
        extra={
          <Button
            type="primary"
            icon={<IconPlus size={16} />}
            onClick={() => router.push("/rasn-naskah/generate-document/create")}
          >
            Buat Baru
          </Button>
        }
      >
        <Card size="small" styles={{ body: { padding: 16 } }}>
          <Stack gap={16}>
            {/* Search */}
            <Input.Search
              placeholder="Cari dokumen..."
              allowClear
              style={{ maxWidth: 300 }}
              onSearch={setSearch}
              onChange={(e) => !e.target.value && setSearch("")}
            />

            {/* Table */}
            <Table
              dataSource={data?.data || []}
              columns={columns}
              rowKey="id"
              loading={isLoading}
              pagination={{
                total: data?.meta?.total || 0,
                showTotal: (total) => `Total ${total} dokumen`,
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={<IconFileText size={48} color="#d9d9d9" />}
                    imageStyle={{ height: 60 }}
                    description="Belum ada dokumen yang di-generate"
                  >
                    <Button
                      type="primary"
                      icon={<IconPlus size={14} />}
                      onClick={() => router.push("/rasn-naskah/generate-document/create")}
                    >
                      Buat Dokumen Pertama
                    </Button>
                  </Empty>
                ),
              }}
            />
          </Stack>
        </Card>
      </PageContainer>
    </>
  );
};

GenerateDocumentIndex.getLayout = function getLayout(page) {
  return (
    <LayoutRasnNaskah active="/rasn-naskah/generate-document">
      {page}
    </LayoutRasnNaskah>
  );
};

GenerateDocumentIndex.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default GenerateDocumentIndex;
