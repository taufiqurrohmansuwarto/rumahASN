import PageContainer from "@/components/PageContainer";
import SapaASNLayout from "@/components/SapaASN/SapaASNLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { getDashboardSummary } from "@/services/sapa-asn.services";
import {
  Alert,
  Badge,
  Box,
  Grid,
  Group,
  Paper,
  RingProgress,
  Skeleton,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconGavel,
  IconMessageQuestion,
  IconPlus,
  IconShieldCheck,
  IconX,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, FloatButton, Tag } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import Head from "next/head";

dayjs.extend(relativeTime);
dayjs.locale("id");
import Link from "next/link";
import { useRouter } from "next/router";

dayjs.locale("id");

const StatCard = ({ title, value, icon: Icon, color, pending, completed, href, loading }) => (
  <Link href={href}>
    <Paper p="md" radius="md" withBorder style={{ cursor: "pointer" }} className="hover-card">
      {loading ? (
        <Skeleton height={80} radius="md" />
      ) : (
        <Group justify="space-between">
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              {title}
            </Text>
            <Text size="xl" fw={700} mt={4}>
              {value}
            </Text>
            <Group gap="xs" mt={4}>
              {pending > 0 && (
                <Badge color="orange" variant="light" size="xs">
                  {pending} menunggu
                </Badge>
              )}
              {completed > 0 && (
                <Badge color="green" variant="light" size="xs">
                  {completed} selesai
                </Badge>
              )}
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

const StatusCard = ({ title, data, loading }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  return (
    <Paper p="md" radius="md" withBorder h="100%">
      <Text fw={600} mb="md">{title}</Text>
      {loading ? (
        <Skeleton height={180} radius="md" />
      ) : (
        <>
          <Group justify="center" mb="md">
            <RingProgress
              size={120}
              thickness={12}
              roundCaps
              sections={data.map((item) => ({
                value: total ? (item.value / total) * 100 : 0,
                color: item.color,
              }))}
              label={
                <Text ta="center" size="lg" fw={700}>
                  {total}
                </Text>
              }
            />
          </Group>
          <Stack gap="xs">
            {data.map((item, idx) => (
              <Group key={idx} justify="space-between">
                <Group gap="xs">
                  <Box
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 4,
                      backgroundColor: `var(--mantine-color-${item.color}-6)`,
                    }}
                  />
                  <Text size="sm">{item.label}</Text>
                </Group>
                <Badge color={item.color} variant="light">
                  {item.value}
                </Badge>
              </Group>
            ))}
          </Stack>
        </>
      )}
    </Paper>
  );
};

const RecentActivity = ({ activities, loading }) => {
  const router = useRouter();

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "selesai":
        return <IconCheck size={16} />;
      case "rejected":
      case "ditolak":
      case "cancelled":
        return <IconX size={16} />;
      default:
        return <IconClock size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "selesai":
        return "green";
      case "rejected":
      case "ditolak":
        return "red";
      case "cancelled":
        return "gray";
      case "diterima":
      case "approved":
      case "scheduled":
        return "blue";
      default:
        return "orange";
    }
  };

  const getLink = (activity) => {
    switch (activity.type) {
      case "advokasi":
        return `/sapa-asn/advokasi?selectedId=${activity.id}`;
      case "konsultasi":
        return `/sapa-asn/konsultasi-hukum?selectedId=${activity.id}`;
      case "pendampingan":
        return `/sapa-asn/pendampingan-hukum?selectedId=${activity.id}`;
      default:
        return "#";
    }
  };

  return (
    <Paper p="md" radius="md" withBorder>
      <Text fw={600} mb="md">Aktivitas Terbaru</Text>
      {loading ? (
        <Stack gap="sm">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={50} radius="md" />
          ))}
        </Stack>
      ) : activities?.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          Belum ada aktivitas
        </Text>
      ) : (
        <Stack gap="sm">
          {activities?.map((activity, idx) => (
            <Group
              key={idx}
              justify="space-between"
              p="xs"
              style={{ borderRadius: 8, backgroundColor: "var(--mantine-color-gray-0)", cursor: "pointer" }}
              onClick={() => router.push(getLink(activity))}
            >
              <Group gap="sm">
                <ThemeIcon size={32} radius="md" color={getStatusColor(activity.status)} variant="light">
                  {getStatusIcon(activity.status)}
                </ThemeIcon>
                <div>
                  <Text size="sm" fw={500}>{activity.typeLabel}</Text>
                  <Text size="xs" c="dimmed">{activity.id}</Text>
                </div>
              </Group>
              <Stack gap={2} align="flex-end">
                <Tag color={getStatusColor(activity.status)} style={{ fontSize: 10 }}>
                  {activity.status}
                </Tag>
                <Text size="xs" c="dimmed">
                  {dayjs(activity.date).fromNow()}
                </Text>
              </Stack>
            </Group>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

const UpcomingSchedule = ({ jadwal, loading }) => {
  if (loading) {
    return (
      <Paper p="md" radius="md" withBorder>
        <Text fw={600} mb="md">Jadwal Mendatang</Text>
        <Skeleton height={100} radius="md" />
      </Paper>
    );
  }

  if (!jadwal || jadwal.length === 0) {
    return null;
  }

  return (
    <Paper p="md" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text fw={600}>Jadwal Konsultasi Mendatang</Text>
        <Link href="/sapa-asn/advokasi">
          <Button type="link" size="small">Lihat Semua</Button>
        </Link>
      </Group>
      <Stack gap="sm">
        {jadwal.map((item, idx) => (
          <Alert
            key={idx}
            icon={<IconCalendarEvent size={18} />}
            color="blue"
            variant="light"
          >
            <Group justify="space-between" wrap="wrap">
              <div>
                <Text size="sm" fw={600}>
                  {item.tanggal
                    ? dayjs(item.tanggal).format("dddd, D MMMM YYYY")
                    : "Jadwal belum ditentukan"}
                </Text>
                <Text size="xs" c="dimmed">
                  {item.waktu || "10:00 - 12:00"} WIB
                </Text>
              </div>
              <Tag color="blue">{item.status}</Tag>
            </Group>
          </Alert>
        ))}
      </Stack>
    </Paper>
  );
};

const QuickActions = () => {
  const router = useRouter();
  return (
    <Group gap="sm" wrap="wrap">
      <Text size="sm" fw={500} c="dimmed">Ajukan:</Text>
      <Button
        type="primary"
        icon={<IconGavel size={14} />}
        onClick={() => router.push("/sapa-asn/advokasi/create")}
      >
        Sesi Advokasi
      </Button>
      <Button
        type="primary"
        icon={<IconMessageQuestion size={14} />}
        onClick={() => router.push("/sapa-asn/konsultasi-hukum/create")}
      >
        Konsultasi Hukum
      </Button>
      <Button
        type="primary"
        icon={<IconShieldCheck size={14} />}
        onClick={() => router.push("/sapa-asn/pendampingan-hukum/create")}
      >
        Pendampingan Hukum
      </Button>
    </Group>
  );
};

const AdvokasiAlert = ({ canSubmit, existingAdvokasi }) => {
  const router = useRouter();

  if (canSubmit) {
    return (
      <Alert
        icon={<IconGavel size={18} />}
        color="green"
        variant="light"
        title="Anda dapat mengajukan sesi advokasi bulan ini"
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Text size="sm">
            Jadwal sesi advokasi: Kamis minggu ke-2 & ke-4, pukul 10:00-12:00 WIB
          </Text>
          <Button
            type="primary"
            size="small"
            icon={<IconPlus size={14} />}
            onClick={() => router.push("/sapa-asn/advokasi/create")}
          >
            Ajukan Sekarang
          </Button>
        </Group>
      </Alert>
    );
  }

  if (existingAdvokasi) {
    return (
      <Alert
        icon={<IconAlertCircle size={18} />}
        color="orange"
        variant="light"
        title="Anda sudah terdaftar sesi advokasi bulan ini"
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Text size="sm">
            Status: <Tag color="orange">{existingAdvokasi.status}</Tag>
          </Text>
          <Button
            type="default"
            size="small"
            onClick={() => router.push(`/sapa-asn/advokasi?selectedId=${existingAdvokasi.id}`)}
          >
            Lihat Detail
          </Button>
        </Group>
      </Alert>
    );
  }

  return null;
};

const DashboardSapaASN = () => {
  useScrollRestoration();

  const { data, isLoading } = useQuery({
    queryKey: ["sapa-asn-dashboard"],
    queryFn: getDashboardSummary,
  });

  const summary = data?.summary || {};
  const advokasi = summary.advokasi || {};
  const konsultasi = summary.konsultasi_hukum || {};
  const pendampingan = summary.pendampingan_hukum || {};

  const advokasiStatusData = [
    { label: "Menunggu", value: advokasi.pending || 0, color: "orange" },
    { label: "Diterima", value: advokasi.diterima || 0, color: "blue" },
    { label: "Selesai", value: advokasi.selesai || 0, color: "green" },
  ];

  const konsultasiStatusData = [
    { label: "Menunggu", value: konsultasi.pending || 0, color: "orange" },
    { label: "Selesai", value: konsultasi.selesai || 0, color: "green" },
  ];

  const pendampinganStatusData = [
    { label: "Menunggu", value: pendampingan.pending || 0, color: "orange" },
    { label: "Selesai", value: pendampingan.selesai || 0, color: "green" },
  ];

  return (
    <>
      <Head>
        <title>Rumah ASN - Dashboard Sapa ASN</title>
      </Head>
      <PageContainer
        title="Dashboard Sapa ASN"
        subTitle="Layanan hukum dan advokasi untuk ASN"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/sapa-asn/dashboard">Sapa ASN</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <Stack gap="md">
          {/* Quick Actions CTA */}
          <QuickActions />

          {/* Advokasi Alert */}
          <AdvokasiAlert
            canSubmit={data?.can_submit_advokasi}
            existingAdvokasi={data?.advokasi_this_month}
          />

          {/* Summary Cards */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <StatCard
              title="Pengaduan & Advokasi"
              value={advokasi.total || 0}
              icon={IconGavel}
              color="indigo"
              pending={advokasi.pending || 0}
              completed={advokasi.selesai || 0}
              href="/sapa-asn/advokasi"
              loading={isLoading}
            />
            <StatCard
              title="Konsultasi Hukum"
              value={konsultasi.total || 0}
              icon={IconMessageQuestion}
              color="teal"
              pending={konsultasi.pending || 0}
              completed={konsultasi.selesai || 0}
              href="/sapa-asn/konsultasi-hukum"
              loading={isLoading}
            />
            <StatCard
              title="Pendampingan Hukum"
              value={pendampingan.total || 0}
              icon={IconShieldCheck}
              color="grape"
              pending={pendampingan.pending || 0}
              completed={pendampingan.selesai || 0}
              href="/sapa-asn/pendampingan-hukum"
              loading={isLoading}
            />
          </SimpleGrid>

          {/* Upcoming Schedule */}
          <UpcomingSchedule
            jadwal={data?.upcoming_jadwal}
            loading={isLoading}
          />

          {/* Status Charts & Recent Activity */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <RecentActivity
                activities={data?.recent_activities}
                loading={isLoading}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="md">
                <StatusCard
                  title="Status Advokasi"
                  data={advokasiStatusData}
                  loading={isLoading}
                />
              </Stack>
            </Grid.Col>
          </Grid>

          {/* More Status Cards */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <StatusCard
                title="Status Konsultasi Hukum"
                data={konsultasiStatusData}
                loading={isLoading}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <StatusCard
                title="Status Pendampingan Hukum"
                data={pendampinganStatusData}
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

DashboardSapaASN.getLayout = (page) => (
  <SapaASNLayout active="/sapa-asn/dashboard">{page}</SapaASNLayout>
);

DashboardSapaASN.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default DashboardSapaASN;
