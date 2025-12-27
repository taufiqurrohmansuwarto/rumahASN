import LayoutRasnNaskah from "@/components/RasnNaskah/LayoutRasnNaskah";
import PageContainer from "@/components/PageContainer";
import { useRasnNaskahBookmarks } from "@/hooks/useRasnNaskah";
import {
  IconBookmark,
  IconEye,
  IconFileText,
  IconTrash,
} from "@tabler/icons-react";
import {
  Breadcrumb,
  Button,
  Card,
  Empty,
  List,
  Popconfirm,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeBookmark } from "@/services/rasn-naskah.services";

dayjs.extend(relativeTime);
dayjs.locale("id");

const { Text, Title } = Typography;

const RasnNaskahBookmarks = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading } = useRasnNaskahBookmarks();

  const removeBookmarkMutation = useMutation({
    mutationFn: (documentId) => removeBookmark(documentId),
    onSuccess: () => {
      message.success("Bookmark dihapus");
      queryClient.invalidateQueries(["rasn-naskah-bookmarks"]);
    },
    onError: () => {
      message.error("Gagal menghapus bookmark");
    },
  });

  const getDocumentTypeColor = (type) => {
    const colors = {
      surat_dinas: "blue",
      nota_dinas: "green",
      surat_keputusan: "purple",
      surat_edaran: "orange",
      pengumuman: "cyan",
      laporan: "magenta",
      other: "default",
    };
    return colors[type] || "default";
  };

  const getDocumentTypeLabel = (type) => {
    const labels = {
      surat_dinas: "Surat Dinas",
      nota_dinas: "Nota Dinas",
      surat_keputusan: "Surat Keputusan",
      surat_edaran: "Surat Edaran",
      pengumuman: "Pengumuman",
      laporan: "Laporan",
      other: "Lainnya",
    };
    return labels[type] || type;
  };

  return (
    <>
      <Head>
        <title>SAKTI Naskah - Ditandai</title>
      </Head>
      <PageContainer
        title="Dokumen Ditandai"
        subTitle="Daftar dokumen yang telah Anda tandai"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/rasn-naskah">SAKTI Naskah</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Ditandai</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <Card>
          <Spin spinning={isLoading}>
            {data?.data?.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={data.data}
                renderItem={(bookmark) => (
                  <List.Item
                    actions={[
                      <Button
                        key="view"
                        type="text"
                        icon={<IconEye size={16} />}
                        onClick={() =>
                          router.push(
                            `/rasn-naskah/documents/${bookmark.document.id}`
                          )
                        }
                      >
                        Lihat
                      </Button>,
                      <Popconfirm
                        key="remove"
                        title="Hapus dari bookmark?"
                        onConfirm={() =>
                          removeBookmarkMutation.mutate(bookmark.document.id)
                        }
                        okText="Ya"
                        cancelText="Tidak"
                      >
                        <Button
                          type="text"
                          danger
                          icon={<IconTrash size={16} />}
                          loading={removeBookmarkMutation.isLoading}
                        >
                          Hapus
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<IconFileText size={32} color="#1890ff" />}
                      title={
                        <Space>
                          <Link
                            href={`/rasn-naskah/documents/${bookmark.document.id}`}
                          >
                            {bookmark.document.title}
                          </Link>
                          <Tag
                            color={getDocumentTypeColor(
                              bookmark.document.document_type
                            )}
                          >
                            {getDocumentTypeLabel(
                              bookmark.document.document_type
                            )}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          {bookmark.notes && (
                            <Text type="secondary">{bookmark.notes}</Text>
                          )}
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <IconBookmark size={12} /> Ditandai{" "}
                            {dayjs(bookmark.created_at).fromNow()}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical">
                    <Text>Belum ada dokumen yang ditandai</Text>
                    <Button
                      type="primary"
                      onClick={() => router.push("/rasn-naskah")}
                    >
                      Lihat Dokumen
                    </Button>
                  </Space>
                }
              />
            )}
          </Spin>
        </Card>
      </PageContainer>
    </>
  );
};

RasnNaskahBookmarks.getLayout = function getLayout(page) {
  return (
    <LayoutRasnNaskah active="/rasn-naskah/bookmarks">{page}</LayoutRasnNaskah>
  );
};

RasnNaskahBookmarks.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RasnNaskahBookmarks;
