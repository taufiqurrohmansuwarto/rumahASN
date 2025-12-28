import LayoutRasnNaskah from "@/components/RasnNaskah/LayoutRasnNaskah";
import PageContainer from "@/components/PageContainer";
import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import {
  getDocument,
  updateDocument,
  deleteDocument,
  generateDocument,
} from "@/services/rasn-naskah.services";
import { Stack, Text, Group } from "@mantine/core";
import {
  IconCopy,
  IconDeviceFloppy,
  IconEdit,
  IconRefresh,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import {
  Button,
  Card,
  Input,
  message,
  Popconfirm,
  Skeleton,
  Tag,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

dayjs.extend(relativeTime);
dayjs.locale("id");

const { TextArea } = Input;

const categoryLabels = {
  nota_dinas: "Nota Dinas",
  surat_dinas: "Surat Dinas",
  undangan: "Undangan",
  surat_tugas: "Surat Tugas",
  pengumuman: "Pengumuman",
  surat_edaran: "Surat Edaran",
  laporan: "Laporan",
};

const GenerateDocumentDetail = () => {
  const router = useRouter();
  const { id, edit } = router.query;
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Get document
  const { data: doc, isLoading } = useQuery(
    ["generate-document", id],
    () => getDocument(id),
    { enabled: !!id }
  );

  // Set edit mode from query param
  useEffect(() => {
    if (edit === "true") {
      setIsEditing(true);
      setEditContent(doc?.content || "");
    }
  }, [edit, doc?.content]);

  // Clean content (remove markdown wrapper)
  const cleanContent = useMemo(() => {
    if (!doc?.content) return null;
    let content = doc.content.trim();
    if (content.startsWith("```markdown")) {
      content = content.slice(11);
    } else if (content.startsWith("```")) {
      content = content.slice(3);
    }
    if (content.endsWith("```")) {
      content = content.slice(0, -3);
    }
    return content.trim();
  }, [doc?.content]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => updateDocument({ documentId: id, ...data }),
    onSuccess: () => {
      message.success("Dokumen berhasil diperbarui");
      queryClient.invalidateQueries(["generate-document", id]);
      queryClient.invalidateQueries(["generate-documents"]);
      setIsEditing(false);
    },
    onError: (error) => {
      message.error(
        error?.response?.data?.message || "Gagal memperbarui dokumen"
      );
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteDocument(id),
    onSuccess: () => {
      message.success("Dokumen berhasil dihapus");
      queryClient.invalidateQueries(["generate-documents"]);
      router.push("/rasn-naskah/generate-document");
    },
    onError: () => {
      message.error("Gagal menghapus dokumen");
    },
  });

  // Regenerate mutation
  const regenerateMutation = useMutation({
    mutationFn: () =>
      generateDocument({
        document_type: doc?.category,
        recipient: doc?.metadata?.recipient,
        description: doc?.metadata?.description,
      }),
    onSuccess: (response) => {
      const newContent = response?.data?.content || response?.content;
      setEditContent(newContent);
      setIsEditing(true);
      setIsRegenerating(false);
      message.success("Naskah berhasil digenerate ulang");
    },
    onError: (error) => {
      setIsRegenerating(false);
      message.error(
        error?.response?.data?.message || "Gagal generate ulang"
      );
    },
  });

  const handleCopy = () => {
    const content = isEditing ? editContent : cleanContent;
    if (content) {
      navigator.clipboard.writeText(content);
      message.success("Konten disalin!");
    }
  };

  const handleEdit = () => {
    setEditContent(doc?.content || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent("");
  };

  const handleSave = () => {
    updateMutation.mutate({ content: editContent });
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    regenerateMutation.mutate();
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>SAKTI Naskah - Dokumen</title>
        </Head>
        <PageContainer
          onBack={() => router.back()}
          title="Memuat..."
          breadcrumb={{
            items: [
              { title: "SAKTI Naskah", path: "/rasn-naskah" },
              { title: "Generate AI", path: "/rasn-naskah/generate-document" },
              { title: "Detail" },
            ],
          }}
        >
          <Card size="small" styles={{ body: { padding: 24 } }}>
            <Skeleton active paragraph={{ rows: 10 }} />
          </Card>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>SAKTI Naskah - {doc?.title || "Dokumen"}</title>
      </Head>
      <PageContainer
        onBack={() => router.back()}
        title={doc?.title || "Dokumen"}
        subTitle={dayjs(doc?.created_at).format("DD MMM YYYY HH:mm")}
        breadcrumb={{
          items: [
            { title: "SAKTI Naskah", path: "/rasn-naskah" },
            { title: "Generate AI", path: "/rasn-naskah/generate-document" },
            { title: doc?.title?.slice(0, 20) || "Detail" },
          ],
        }}
        extra={
          <Group gap={8}>
            {!isEditing ? (
              <>
                <Button
                  icon={<IconRefresh size={16} />}
                  onClick={handleRegenerate}
                  loading={regenerateMutation.isLoading}
                >
                  Generate Ulang
                </Button>
                <Button
                  icon={<IconEdit size={16} />}
                  onClick={handleEdit}
                >
                  Edit
                </Button>
                <Button
                  icon={<IconCopy size={16} />}
                  onClick={handleCopy}
                >
                  Salin
                </Button>
                <Popconfirm
                  title="Hapus dokumen ini?"
                  onConfirm={() => deleteMutation.mutate()}
                  okText="Ya"
                  cancelText="Batal"
                >
                  <Button
                    danger
                    icon={<IconTrash size={16} />}
                    loading={deleteMutation.isLoading}
                  >
                    Hapus
                  </Button>
                </Popconfirm>
              </>
            ) : (
              <>
                <Button
                  icon={<IconX size={16} />}
                  onClick={handleCancelEdit}
                >
                  Batal
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
                  loading={updateMutation.isLoading}
                >
                  Simpan
                </Button>
              </>
            )}
          </Group>
        }
      >
        <Card size="small" styles={{ body: { padding: 24 } }}>
          <Stack gap={16}>
            {/* Document info */}
            <Group gap={8}>
              {doc?.category && (
                <Tag>{categoryLabels[doc.category] || doc.category}</Tag>
              )}
              {doc?.metadata?.recipient && (
                <Text size="xs" c="dimmed">
                  Kepada: {doc.metadata.recipient}
                </Text>
              )}
            </Group>

            {/* Loading regenerate */}
            {isRegenerating && (
              <div style={{ padding: "20px 0" }}>
                <Skeleton active paragraph={{ rows: 8 }} />
              </div>
            )}

            {/* Content */}
            {!isRegenerating && (
              <>
                {isEditing ? (
                  <TextArea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={20}
                    style={{ fontFamily: "inherit" }}
                  />
                ) : (
                  <div
                    style={{
                      background: "#fafafa",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      padding: 24,
                      minHeight: 400,
                      overflow: "auto",
                    }}
                  >
                    <ReactMarkdownCustom>
                      {cleanContent || doc?.content}
                    </ReactMarkdownCustom>
                  </div>
                )}
              </>
            )}
          </Stack>
        </Card>
      </PageContainer>
    </>
  );
};

GenerateDocumentDetail.getLayout = function getLayout(page) {
  return (
    <LayoutRasnNaskah active="/rasn-naskah/generate-document">
      {page}
    </LayoutRasnNaskah>
  );
};

GenerateDocumentDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default GenerateDocumentDetail;
