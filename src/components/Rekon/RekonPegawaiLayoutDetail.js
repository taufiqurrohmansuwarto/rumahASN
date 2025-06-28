import { Stack } from "@mantine/core";
import {
  IconAlertTriangle,
  IconBook,
  IconBuilding,
  IconBulb,
  IconCalculator,
  IconCalendar,
  IconCertificate,
  IconChartLine,
  IconCircleCheck,
  IconCrown,
  IconDoorExit,
  IconFileText,
  IconFolderOpen,
  IconGift,
  IconHeart,
  IconScale,
  IconSchool,
  IconShield,
  IconStar,
  IconTrendingUp,
  IconTrophy,
  IconUserCheck,
  IconUsers,
} from "@tabler/icons-react";
import {
  Grid,
  Segmented,
  Space,
  Tabs,
  Typography,
  Row,
  Col,
  Flex,
  Breadcrumb,
} from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import PageContainer from "../PageContainer";

const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

const RekonPegawaiLayoutDetail = ({
  children,
  activeMenu,
  activeSegmented,
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const router = useRouter();
  const { nip } = router.query;

  const menuRoutes = [
    {
      label: "Personal",
      path: "/personal/keluarga",
      icon: <IconUsers size={14} />,
      color: "#52c41a",
      description: "Keluarga, Pasangan, dan Kedudukan Hukum",
      shortDesc: "👨‍👩‍👧‍👦 Data keluarga dan status hukum",
      children: [
        {
          label: "Keluarga",
          path: "/personal/keluarga",
          icon: <IconHeart size={12} />,
          desc: "Suami/istri, anak, dan keluarga lainnya",
        },
        {
          label: "Data Pasangan",
          path: "/personal/pasangan",
          icon: <IconUserCheck size={12} />,
          desc: "Informasi suami atau istri",
        },
        {
          label: "Status Hukum",
          path: "/personal/kedudukan-hukum",
          icon: <IconBuilding size={12} />,
          desc: "Kedudukan dan status hukum pegawai",
        },
      ],
    },
    {
      label: "Karir & Jabatan",
      path: "/career/jabatan",
      icon: <IconTrendingUp size={14} />,
      color: "#1890ff",
      description: "Jabatan, Pangkat, dan Masa Kerja",
      shortDesc: "🚀 Perjalanan karir dan jabatan",
      children: [
        {
          label: "Jabatan",
          path: "/career/jabatan",
          icon: <IconCrown size={12} />,
          desc: "Semua jabatan yang pernah dijalani",
        },
        {
          label: "Tingkat Pangkat",
          path: "/career/pangkat",
          icon: <IconStar size={12} />,
          desc: "Perubahan pangkat dan golongan",
        },
        {
          label: "Masa Kerja",
          path: "/career/masa-kerja",
          icon: <IconCalendar size={12} />,
          desc: "Total masa kerja dan pengalaman",
        },
      ],
    },
    {
      label: "Pendidikan",
      path: "/education/pendidikan",
      icon: <IconBook size={14} />,
      color: "#722ed1",
      description: "Pendidikan, Diklat & Kursus",
      shortDesc: "🎓 Pendidikan dan pelatihan",
      children: [
        {
          label: "Pendidikan Formal",
          path: "/education/pendidikan",
          icon: <IconSchool size={12} />,
          desc: "SD, SMP, SMA, dan perguruan tinggi",
        },
        {
          label: "Diklat & Kursus",
          path: "/education/diklat",
          icon: <IconCertificate size={12} />,
          desc: "Pelatihan dan kursus yang diikuti",
        },
        {
          label: "Keahlian",
          path: "/education/kompetensi",
          icon: <IconBulb size={12} />,
          desc: "Kompetensi dan kemampuan khusus",
        },
        {
          label: "Potensi Diri",
          path: "/education/potensi",
          icon: <IconStar size={12} />,
          desc: "Penilaian potensi dan bakat",
        },
      ],
    },
    {
      label: "Kinerja",
      path: "/performance/skp",
      icon: <IconTrophy size={14} />,
      color: "#fa8c16",
      description: "SKP, Kinerja Periodik, dan Angka Kredit",
      shortDesc: "📊 Hasil kerja dan prestasi",
      children: [
        {
          label: "Sasaran Kerja",
          path: "/performance/skp",
          icon: <IconCircleCheck size={12} />,
          desc: "SKP dan target pencapaian",
        },
        {
          label: "Penilaian Berkala",
          path: "/performance/kinerja-periodik",
          icon: <IconChartLine size={12} />,
          desc: "Evaluasi kinerja rutin",
        },
        {
          label: "Angka Kredit",
          path: "/performance/angka-kredit",
          icon: <IconCalculator size={12} />,
          desc: "Poin kredit untuk kenaikan pangkat",
        },
      ],
    },
    {
      label: "Hukum & Disiplin",
      path: "/legal/hukdis",
      icon: <IconScale size={14} />,
      color: "#f5222d",
      description: "Hukuman, Pelanggaran, dan Penghargaan",
      shortDesc: "⚖️ Catatan hukum dan penghargaan",
      children: [
        {
          label: "Hukuman Disiplin",
          path: "/legal/hukdis",
          icon: <IconAlertTriangle size={12} />,
          desc: "Catatan pelanggaran dan sanksi",
        },
        {
          label: "CLTN",
          path: "/legal/cltn",
          icon: <IconShield size={12} />,
          desc: "Catatan Layanan Terpadu Nasional",
        },
        {
          label: "Penghargaan",
          path: "/legal/penghargaan",
          icon: <IconGift size={12} />,
          desc: "Tanda jasa dan penghargaan",
        },
        {
          label: "Pemberhentian",
          path: "/legal/pemberhentian",
          icon: <IconDoorExit size={12} />,
          desc: "Proses dan status pemberhentian",
        },
      ],
    },
    {
      label: "Dokumen",
      path: "/documents",
      icon: <IconFolderOpen size={14} />,
      color: "#13c2c2",
      description: "Koleksi dokumen dan berkas penting",
      shortDesc: "📁 Berkas dan dokumen",
      children: [
        {
          label: "Semua Dokumen",
          path: "/documents/dokumen",
          icon: <IconFileText size={12} />,
          desc: "File dan berkas pendukung",
        },
      ],
    },
  ];

  // Get active menu route
  const activeMenuRoute = useMemo(() => {
    return menuRoutes.find((route) => route.path === activeMenu);
  }, [activeMenu]);

  // Generate tab items
  const tabItems = useMemo(() => {
    return menuRoutes.map((route) => ({
      key: route.path,
      label: (
        <Link href={`/rekon/pegawai/${nip}${route.path}`}>
          <Stack>
            <Space size={6}>
              <span style={{ color: route.color }}>{route.icon}</span>
              <Text strong style={{ fontSize: "16ox" }}>
                {route.label}
              </Text>
            </Space>
            {!isMobile && (
              <Text
                type="secondary"
                style={{ fontSize: "12px", lineHeight: 1.2 }}
              >
                {route.description}
              </Text>
            )}
          </Stack>
        </Link>
      ),
    }));
  }, [nip, isMobile]);

  // Generate segmented options
  const segmentedOptions = useMemo(() => {
    if (!activeMenuRoute?.children) return [];

    return activeMenuRoute.children.map((child) => ({
      label: child.label,
      value: child.path,
    }));
  }, [activeMenuRoute]);

  return (
    <PageContainer
      title={activeMenuRoute?.label}
      subTitle={activeMenuRoute?.description}
      header={{
        breadcrumbRender: () => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/rekon/dashboard">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/rekon/pegawai">Daftar Pegawai</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{nip}</Breadcrumb.Item>
            {activeSegmented && (
              <Breadcrumb.Item>
                <Link href={`/rekon/pegawai/${nip}${activeSegmented}`}>
                  {activeMenuRoute?.children?.find(
                    (child) => child.path === activeSegmented
                  )?.label || activeSegmented}
                </Link>
              </Breadcrumb.Item>
            )}
          </Breadcrumb>
        ),
      }}
    >
      <Row gutter={[12, 16]}>
        {/* Tabs Section */}
        <Col xs={24} md={7} lg={5}>
          <Flex vertical>
            <Tabs
              tabPosition={isMobile ? "top" : "left"}
              activeKey={activeMenu}
              items={tabItems}
              style={{
                height: isMobile ? "auto" : "100%",
                width: isMobile ? "100%" : "260px",
              }}
            />
          </Flex>
        </Col>

        {/* Content Section */}
        <Col xs={24} md={17} lg={19}>
          <Flex vertical gap="middle">
            {/* Segmented Navigation */}
            {segmentedOptions.length > 0 && (
              <div style={{ width: "auto", display: "inline-block" }}>
                <Segmented
                  options={segmentedOptions}
                  style={{ width: "auto", maxWidth: "max-content" }}
                  onChange={(value) => {
                    const route = `/rekon/pegawai/${nip}${value}`;
                    router.push(route);
                  }}
                  value={activeSegmented}
                  size={isMobile ? "small" : "middle"}
                />
              </div>
            )}

            {/* Content */}
            {children}
          </Flex>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default RekonPegawaiLayoutDetail;
