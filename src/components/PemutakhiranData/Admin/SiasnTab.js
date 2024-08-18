import AdministrasiByNip from "@/components/Berkas/AdministrasiByNip";
import AdministrasiPerbaikanByNip from "@/components/Berkas/AdministrasiPerbaikanByNip";
import { ActiveTabProvider, useActiveTab } from "@/context/TabContext";
import { Stack } from "@mantine/core";
import { Alert, FloatButton, Grid, Tabs } from "antd";
import React, { useCallback, useMemo } from "react";
import CompareDataDiklatByNip from "../CompareDataDiklatByNip";
import ComparePenghargaanByNip from "../ComparePenghargaanByNip";
import CompareAngkaKreditByNip from "./CompareAngkaKreditByNip";
import CompareCLTNByNip from "./CompareCLTNByNip";
import CompareDataUtamaByNip from "./CompareDataUtamaByNip";
import CompareHukdisByNip from "./CompareHukdisByNip";
import CompareJabatanByNip from "./CompareJabatanByNip";
import CompareKedudukanHukumByNip from "./CompareKedudukanHukumByNip";
import CompareKeluargaByNip from "./CompareKeluargaByNip";
import CompareKinerjaPeriodikNip from "./CompareKinerjaPeriodikNip";
import CompareMasaKerjaByNip from "./CompareMasaKerjaByNip";
import ComparePemberhentianByNip from "./ComparePemberhentianByNip";
import CompareSKP22ByNip from "./CompareSKP22ByNip";

const DEFAULT_ACTIVE_KEY = "data-utama";

function SiasnTab({ nip }) {
  const breakPoint = Grid.useBreakpoint();
  const { setActiveTab } = useActiveTab();

  const handleTabChange = useCallback(
    (key) => {
      setActiveTab(key);
    },
    [setActiveTab]
  );

  const tabItems = useMemo(
    () => [
      {
        key: "data-utama",
        tab: "Data Utama",
        content: <CompareDataUtamaByNip nip={nip} />,
      },
      {
        key: "berkas",
        tab: "Berkas",
        content: (
          <Stack>
            <AdministrasiByNip />
            <AdministrasiPerbaikanByNip />
          </Stack>
        ),
      },
      {
        key: "jab-pend-pangkat",
        tab: "Jab, Pend, & Pangkat",
        content: <CompareJabatanByNip nip={nip} />,
      },
      {
        key: "kinerja",
        tab: "Kinerja (SKP)",
        content: <CompareSKP22ByNip nip={nip} />,
      },
      {
        key: "kinerja-periodik",
        tab: "Kinerja Periodik",
        content: <CompareKinerjaPeriodikNip nip={nip} />,
      },
      {
        key: "angka-kredit",
        tab: "Angka Kredit",
        content: <CompareAngkaKreditByNip nip={nip} />,
      },
      {
        key: "diklat-dan-kursus",
        tab: "Diklat dan Kursus",
        content: <CompareDataDiklatByNip nip={nip} />,
      },
      {
        key: "pemberhentian",
        tab: "Pemberhentian",
        content: <ComparePemberhentianByNip nip={nip} />,
      },
      {
        key: "kedudukan-hukum",
        tab: "Kedudukan Hukum",
        content: <CompareKedudukanHukumByNip nip={nip} />,
      },
      {
        key: "keluarga",
        tab: "Keluarga",
        content: <CompareKeluargaByNip nip={nip} />,
      },
      {
        key: "masa-kerja",
        tab: "Masa Kerja",
        content: <CompareMasaKerjaByNip nip={nip} />,
      },
      {
        key: "hukuman-disiplin",
        tab: "Hukuman Disiplin",
        content: <CompareHukdisByNip nip={nip} />,
      },
      { key: "cltn", tab: "CLTN", content: <CompareCLTNByNip nip={nip} /> },
      {
        key: "penghargaan",
        tab: "Penghargaan",
        content: <ComparePenghargaanByNip nip={nip} />,
      },
    ],
    [nip]
  );

  return (
    <ActiveTabProvider>
      <Alert
        banner
        type="info"
        message="Integrasi dengan SIASN yang sudah adalah Jabatan, Angka Kredit, Kinerja Periodik, Diklat, dan Penghargaan"
        style={{ marginBottom: 10 }}
      />
      <Tabs
        onChange={handleTabChange}
        type="card"
        tabPosition={breakPoint.xs ? "top" : "left"}
        defaultActiveKey={DEFAULT_ACTIVE_KEY}
        items={tabItems.map(({ key, tab, content }) => ({
          key,
          label: tab,
          children: content,
        }))}
      />
      <FloatButton.BackTop />
    </ActiveTabProvider>
  );
}

export default React.memo(SiasnTab);
