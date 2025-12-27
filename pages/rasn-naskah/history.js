import LayoutRasnNaskah from "@/components/RasnNaskah/LayoutRasnNaskah";
import PageContainer from "@/components/PageContainer";
import { useRasnNaskahReviewStats } from "@/hooks/useRasnNaskah";
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconFileText,
  IconSearch,
} from "@tabler/icons-react";
import {
  Breadcrumb,
  Card,
  Col,
  Empty,
  Input,
  List,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

dayjs.extend(relativeTime);
dayjs.locale("id");

const { Text } = Typography;

const RasnNaskahHistory = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: stats, isLoading } = useRasnNaskahReviewStats();

  const getStatusColor = (status) => {
    const colors = {
      pending: "processing",
      in_progress: "warning",
      completed: "success",
      failed: "error",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Menunggu",
      in_progress: "Sedang Proses",
      completed: "Selesai",
      failed: "Gagal",
    };
    return labels[status] || status;
  };

  return (
    <>
      <Head>
        <title>SAKTI Naskah - Riwayat Review</title>
      </Head>
      <PageContainer
        title="Riwayat Review"
        subTitle="Lihat riwayat semua review dokumen Anda"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/rasn-naskah">SAKTI Naskah</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Riwayat</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <Spin spinning={isLoading}>
          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Review"
                  value={stats?.data?.total_reviews || 0}
                  prefix={<IconFileText size={20} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Selesai"
                  value={stats?.data?.completed_reviews || 0}
                  prefix={<IconCheck size={20} />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Dalam Proses"
                  value={stats?.data?.pending_reviews || 0}
                  prefix={<IconClock size={20} />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Rata-rata Skor"
                  value={stats?.data?.average_score?.toFixed(1) || "-"}
                  suffix="/ 100"
                  prefix={<IconCalendar size={20} />}
                />
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Card style={{ marginBottom: 16 }}>
            <Space wrap>
              <Input
                placeholder="Cari dokumen..."
                prefix={<IconSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 250 }}
                allowClear
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
                options={[
                  { value: "all", label: "Semua Status" },
                  { value: "pending", label: "Menunggu" },
                  { value: "in_progress", label: "Sedang Proses" },
                  { value: "completed", label: "Selesai" },
                  { value: "failed", label: "Gagal" },
                ]}
              />
            </Space>
          </Card>

          {/* History List */}
          <Card>
            {stats?.data?.recent_reviews?.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={stats.data.recent_reviews}
                renderItem={(review) => (
                  <List.Item
                    actions={[
                      <Link
                        key="view"
                        href={`/rasn-naskah/documents/${review.document_id}/review`}
                      >
                        Lihat Detail
                      </Link>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<IconFileText size={32} color="#1890ff" />}
                      title={
                        <Space>
                          <Link
                            href={`/rasn-naskah/documents/${review.document_id}`}
                          >
                            {review.document?.title || "Dokumen"}
                          </Link>
                          <Tag color={getStatusColor(review.status)}>
                            {getStatusLabel(review.status)}
                          </Tag>
                          {review.overall_score && (
                            <Tag
                              color={
                                review.overall_score >= 80
                                  ? "green"
                                  : review.overall_score >= 60
                                  ? "orange"
                                  : "red"
                              }
                            >
                              Skor: {review.overall_score}
                            </Tag>
                          )}
                        </Space>
                      }
                      description={
                        <Space>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <IconClock size={12} /> Direview{" "}
                            {dayjs(review.created_at).fromNow()}
                          </Text>
                          {review.issues_count > 0 && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              • {review.issues_count} masalah ditemukan
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Belum ada riwayat review"
              />
            )}
          </Card>
        </Spin>
      </PageContainer>
    </>
  );
};

RasnNaskahHistory.getLayout = function getLayout(page) {
  return (
    <LayoutRasnNaskah active="/rasn-naskah/history">{page}</LayoutRasnNaskah>
  );
};

RasnNaskahHistory.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RasnNaskahHistory;
