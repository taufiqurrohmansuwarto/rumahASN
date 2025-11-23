import AdministrasiByNip from "@/components/Berkas/AdministrasiByNip";
import AdministrasiPerbaikanByNip from "@/components/Berkas/AdministrasiPerbaikanByNip";
import BerkasJabatanPelaksanaBaruByNip from "@/components/Berkas/BerkasJabatanPelaksanaBaruByNip";
import CompareDataPasanganByNip from "@/components/PemutakhiranData/CompareDataPasanganByNip";
import { ActiveTabProvider, useActiveTab } from "@/context/TabContext";
import { Stack, Text } from "@mantine/core";
import {
  IconAlertTriangle,
  IconAward,
  IconBooks,
  IconBriefcase,
  IconBulb,
  IconCalendarStats,
  IconCertificate,
  IconChartLine,
  IconClock,
  IconDoorExit,
  IconFileText,
  IconFlag,
  IconFolder,
  IconGavel,
  IconHearts,
  IconSchool,
  IconTarget,
  IconTrendingUp,
  IconUser,
} from "@tabler/icons-react";
import { Grid, Tabs } from "antd";
import React, { useCallback, useMemo, useState } from "react";
import CompareDataDiklatByNip from "../CompareDataDiklatByNip";
import ComparePenghargaanByNip from "../ComparePenghargaanByNip";
import CompareRwKompetensiByNip from "../CompareRwKompetensiByNip";
import CompareRwPotensiByNip from "../CompareRwPotensiByNip";
import CompareSertifikasiByNip from "../CompareSertifikasiByNip";
import CompareTugasBelajarByNip from "../CompareTugasBelajarByNip";
import CompareAngkaKreditByNip from "./CompareAngkaKreditByNip";
import CompareCLTNByNip from "./CompareCLTNByNip";
import CompareDataUtamaByNip from "./CompareDataUtamaByNip";
import CompareHukdisByNip from "./CompareHukdisByNip";
import CompareJabatanByNip from "./CompareJabatanByNip";
import CompareKedudukanHukumByNip from "./CompareKedudukanHukumByNip";
import CompareKinerjaPeriodikNip from "./CompareKinerjaPeriodikNip";
import CompareMasaKerjaByNip from "./CompareMasaKerjaByNip";
import ComparePemberhentianByNip from "./ComparePemberhentianByNip";
import CompareSKP22ByNip from "./CompareSKP22ByNip";
import DokumenPendukungNip from "./DataPendukungNip";

const DEFAULT_ACTIVE_KEY = "data-utama";

function SiasnTab({ nip }) {
  const breakPoint = Grid.useBreakpoint();
  const { setActiveTab } = useActiveTab();
  const [activeKey, setActiveKey] = useState(DEFAULT_ACTIVE_KEY);
  const isMobile = !breakPoint.md;

  const handleTabChange = useCallback(
    (key) => {
      setActiveKey(key);
      setActiveTab(key);
    },
    [setActiveTab]
  );

  const renderTabLabel = (icon, label, key) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? "4px" : "6px",
      }}
    >
      {React.createElement(icon, {
        size: isMobile ? 14 : 16,
        style: { color: activeKey === key ? "#FF4500" : "#666" },
      })}
      <Text
        size={isMobile ? "10px" : "xs"}
        fw={500}
        style={{
          color: activeKey === key ? "#FF4500" : "#666",
          transition: "all 0.2s ease",
        }}
      >
        {label}
      </Text>
    </div>
  );

  const tabItems = useMemo(
    () => [
      {
        key: "data-utama",
        tab: "Data Utama",
        icon: IconUser,
        content: <CompareDataUtamaByNip nip={nip} />,
      },
      {
        key: "berkas",
        tab: "Berkas",
        icon: IconFileText,
        content: (
          <Stack>
            <AdministrasiByNip />
            <AdministrasiPerbaikanByNip />
            <BerkasJabatanPelaksanaBaruByNip />
          </Stack>
        ),
      },
      {
        key: "file",
        tab: "Dokumen Pendukung",
        icon: IconFolder,
        content: <DokumenPendukungNip nip={nip} />,
      },
      {
        key: "jab-pend-pangkat",
        tab: "Jab, Pend, & Pangkat",
        icon: IconBriefcase,
        content: <CompareJabatanByNip nip={nip} />,
      },
      {
        key: "kinerja",
        tab: "Kinerja (SKP)",
        icon: IconChartLine,
        content: <CompareSKP22ByNip nip={nip} />,
      },
      {
        key: "kinerja-periodik",
        tab: "Kinerja Periodik",
        icon: IconCalendarStats,
        content: <CompareKinerjaPeriodikNip nip={nip} />,
      },
      {
        key: "angka-kredit",
        tab: "Angka Kredit",
        icon: IconTrendingUp,
        content: <CompareAngkaKreditByNip nip={nip} />,
      },
      {
        key: "diklat-dan-kursus",
        tab: "Diklat dan Kursus",
        icon: IconSchool,
        content: <CompareDataDiklatByNip nip={nip} />,
      },
      {
        key: "tugas-belajar",
        tab: "Tugas Belajar",
        icon: IconBooks,
        content: <CompareTugasBelajarByNip nip={nip} />,
      },
      {
        key: "sertifikasi",
        tab: "Sertifikasi",
        icon: IconCertificate,
        content: <CompareSertifikasiByNip nip={nip} />,
      },
      {
        key: "pemberhentian",
        tab: "Pemberhentian",
        icon: IconDoorExit,
        content: <ComparePemberhentianByNip nip={nip} />,
      },
      {
        key: "pasangan",
        tab: "Pasangan",
        icon: IconHearts,
        content: <CompareDataPasanganByNip nip={nip} />,
      },
      {
        key: "kedudukan-hukum",
        tab: "Kedudukan Hukum",
        icon: IconGavel,
        content: <CompareKedudukanHukumByNip nip={nip} />,
      },
      {
        key: "masa-kerja",
        tab: "Masa Kerja",
        icon: IconClock,
        content: <CompareMasaKerjaByNip nip={nip} />,
      },
      {
        key: "hukuman-disiplin",
        tab: "Hukuman Disiplin",
        icon: IconAlertTriangle,
        content: <CompareHukdisByNip nip={nip} />,
      },
      {
        key: "cltn",
        tab: "CLTN",
        icon: IconFlag,
        content: <CompareCLTNByNip nip={nip} />,
      },
      {
        key: "penghargaan",
        tab: "Penghargaan",
        icon: IconAward,
        content: <ComparePenghargaanByNip nip={nip} />,
      },
      {
        key: "rw-potensi",
        tab: "Riwayat Potensi",
        icon: IconBulb,
        content: <CompareRwPotensiByNip nip={nip} />,
      },
      {
        key: "rw-kompetensi",
        tab: "Riwayat Kompetensi",
        icon: IconTarget,
        content: <CompareRwKompetensiByNip nip={nip} />,
      },
    ],
    [nip]
  );

  return (
    <ActiveTabProvider>
      <Tabs
        onChange={handleTabChange}
        type="card"
        size={isMobile ? "small" : "middle"}
        tabPosition={breakPoint.xs ? "top" : "left"}
        defaultActiveKey={DEFAULT_ACTIVE_KEY}
        items={tabItems.map(({ key, tab, icon, content }) => ({
          key,
          label: renderTabLabel(icon, tab, key),
          children: content,
        }))}
      />
    </ActiveTabProvider>
  );
}

export default React.memo(SiasnTab);
