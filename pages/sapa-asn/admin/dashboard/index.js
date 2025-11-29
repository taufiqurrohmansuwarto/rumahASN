import PageContainer from "@/components/PageContainer";
import SapaASNLayout from "@/components/SapaASN/SapaASNLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { getAdminDashboardSummary } from "@/services/sapa-asn.services";
import {
  Badge,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconGavel,
  IconMessageQuestion,
  IconShieldCheck,
  IconClock,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, FloatButton, Tag } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

dayjs.extend(relativeTime);
dayjs.locale("id");

const StatCard = ({ title, value, pending, thisMonth, icon: Icon, color, href, loading }) => (
  <Link href={href}>
    <Paper p="md" radius="md" withBorder style={{ cursor: "pointer" }} className="hover-card">
      {loading ? (
        <Skeleton height={100} radius="md" />
      ) : (
        <Group justify="space-between">
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>{title}</Text>
            <Text size="xl" fw={700} mt={4}>{value}</Text>
            <Group gap="xs" mt={4}>
              {pending > 0 && (
                <Badge color="orange" variant="light" size="xs">
                  {pending} pending
                </Badge>
              )}
              <Badge color="blue" variant="light" size="xs">
                +{thisMonth} bulan ini
              </Badge>
            </Group>
          </div>
          <ThemeIcon size={56} radius="md" color={color} variant="light">
            <Icon size={28} />
          </ThemeIcon>
        </Group>
      )}
    </Paper>
  </Link>
);

const PendingList = ({ title, items, type, loading }) => {
  const router = useRouter();

  const getLink = (id) => {
    switch (type) {
      case "advokasi":
        return `/sapa-asn/admin/advokasi?selectedId=${id}`;
      case "konsultasi":
        return `/sapa-asn/admin/konsultasi-hukum?selectedId=${id}`;
      case "pendampingan":
        return `/sapa-asn/admin/pendampingan-hukum?selectedId=${id}`;
      default:
        return "#";
    }
  };

  return (
    <Paper p="md" radius="md" withBorder h="100%">
      <Group justify="space-between" mb="md">
        <Text fw={600}>{title}</Text>
        <Badge color="orange">{items?.length || 0} pending</Badge>
      </Group>
      {loading ? (
        <Stack gap="sm">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={40} radius="md" />
          ))}
        </Stack>
      ) : items?.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          Tidak ada data pending
        </Text>
      ) : (
        <Stack gap="xs">
          {items?.map((item, idx) => (
            <Paper
              key={idx}
              p="xs"
              radius="sm"
              bg="gray.0"
              style={{ cursor: "pointer" }}
              onClick={() => router.push(getLink(item.id))}
            >
              <Group justify="space-between">
                <div>
                  <Text size="xs" fw={500}>{item.user_name}</Text>
                  <Text size="xs" c="dimmed">{item.id}</Text>
                </div>
                <Text size="xs" c="dimmed">
                  {dayjs(item.created_at).fromNow()}
                </Text>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

const AdminDashboard = () => {
  useScrollRestoration();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["sapa-asn-admin-dashboard"],
    queryFn: getAdminDashboardSummary,
  });

  const summary = data?.summary || {};
  const advokasi = summary.advokasi || {};
  const konsultasi = summary.konsultasi_hukum || {};
  const pendampingan = summary.pendampingan_hukum || {};
  const recentPending = data?.recent_pending || {};

  return (
    <>
      <Head>
        <title>Rumah ASN - Admin Dashboard Sapa ASN</title>
      </Head>
      <PageContainer
        title="Dashboard Admin"
        subTitle="Kelola layanan Sapa ASN"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/sapa-asn/admin/dashboard">Sapa ASN Admin</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <Stack gap="md">
          {/* Total Pending Alert */}
          {summary.total_pending > 0 && (
            <Paper p="md" radius="md" withBorder bg="orange.0">
              <Group gap="sm">
                <ThemeIcon color="orange" size="lg" radius="xl">
                  <IconClock size={20} />
                </ThemeIcon>
                <div>
                  <Text size="sm" fw={600}>
                    {summary.total_pending} permohonan menunggu konfirmasi
                  </Text>
                  <Text size="xs" c="dimmed">
                    Segera proses permohonan yang masuk
                  </Text>
                </div>
              </Group>
            </Paper>
          )}

          {/* Summary Cards */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <StatCard
              title="Advokasi"
              value={advokasi.total || 0}
              pending={advokasi.pending || 0}
              thisMonth={advokasi.this_month || 0}
              icon={IconGavel}
              color="indigo"
              href="/sapa-asn/admin/advokasi"
              loading={isLoading}
            />
            <StatCard
              title="Konsultasi Hukum"
              value={konsultasi.total || 0}
              pending={konsultasi.pending || 0}
              thisMonth={konsultasi.this_month || 0}
              icon={IconMessageQuestion}
              color="teal"
              href="/sapa-asn/admin/konsultasi-hukum"
              loading={isLoading}
            />
            <StatCard
              title="Pendampingan Hukum"
              value={pendampingan.total || 0}
              pending={pendampingan.pending || 0}
              thisMonth={pendampingan.this_month || 0}
              icon={IconShieldCheck}
              color="grape"
              href="/sapa-asn/admin/pendampingan-hukum"
              loading={isLoading}
            />
          </SimpleGrid>

          {/* Pending Lists */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <PendingList
                title="Advokasi Pending"
                items={recentPending.advokasi}
                type="advokasi"
                loading={isLoading}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <PendingList
                title="Konsultasi Pending"
                items={recentPending.konsultasi}
                type="konsultasi"
                loading={isLoading}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <PendingList
                title="Pendampingan Pending"
                items={recentPending.pendampingan}
                type="pendampingan"
                loading={isLoading}
              />
            </Grid.Col>
          </Grid>
        </Stack>
        <FloatButton.BackTop />
      </PageContainer>

      <style jsx global>{`
        .hover-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
          transition: all 0.2s ease;
        }
      `}</style>
    </>
  );
};

AdminDashboard.getLayout = (page) => (
  <SapaASNLayout active="/sapa-asn/admin/dashboard">{page}</SapaASNLayout>
);

AdminDashboard.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default AdminDashboard;

