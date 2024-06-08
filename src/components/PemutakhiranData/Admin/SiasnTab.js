import AdministrasiByNip from "@/components/Berkas/AdministrasiByNip";
import { ActiveTabProvider, useActiveTab } from "@/context/TabContext";
import { Alert, FloatButton, Grid, Tabs } from "antd";
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
import ComparePindahInstansiByNip from "./ComparePindahInstansiByNip";
import ComparePwkByNip from "./ComparePwkByNip";
import CompareSKP22ByNip from "./CompareSKP22ByNip";
import SiasnTrackingLayanan from "./SiasnTrackingLayanan";

function SiasnTab({ nip }) {
  const breakPoint = Grid.useBreakpoint();
  const { setActiveTab } = useActiveTab();

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <>
      <Alert
        banner
        type="info"
        message="Integrasi dengan SIASN yang sudah adalah Jabatan, Angka Kredit, Kinerja Periodik, Diklat, dan Penghargaan"
        style={{ marginBottom: 10 }}
      />
      <FloatButton.BackTop />
      <ActiveTabProvider>
        <Tabs
          onChange={handleTabChange}
          type="card"
          tabPosition={breakPoint.xs ? "top" : "left"}
          defaultActiveKey="data-utama"
        >
          <Tabs.TabPane tab="Data Utama" key="data-utama">
            <CompareDataUtamaByNip nip={nip} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Berkas" key="berkas">
            <AdministrasiByNip />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Jab, Pend, & Pangkat" key="jab-pend-pangkat">
            <CompareJabatanByNip nip={nip} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Kinerja Periodik" key="kinerja-periodik">
            <CompareKinerjaPeriodikNip nip={nip} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Angka Kredit" key="angka-kredit">
            <CompareAngkaKreditByNip nip={nip} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Kinerja" key="kinerja">
            <CompareSKP22ByNip nip={nip} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Diklat dan Kursus" key="diklat-dan-kursus">
            <CompareDataDiklatByNip nip={nip} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Pemberhentian" key="pemberhentian">
            <ComparePemberhentianByNip nip={nip} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Kedudukan Hukum" key="kedudukan-hukum">
            <CompareKedudukanHukumByNip nip={nip} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Keluarga" key="keluarga">
            <CompareKeluargaByNip nip={nip} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Masa Kerja" key="masa-kerja">
            <CompareMasaKerjaByNip nip={nip} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Pindah Instansi" key="pindah-instansi">
            <ComparePindahInstansiByNip nip={nip} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Pindah Wilayah Kerja" key="pindah-wilayah-kerja">
            <ComparePwkByNip nip={nip} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Hukuman Disiplin" key="hukuman-disiplin">
            <CompareHukdisByNip nip={nip} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="CLTN" key="cltn">
            <CompareCLTNByNip nip={nip} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Penghargaan" key="penghargaan">
            <ComparePenghargaanByNip nip={nip} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Usulan SIASN" key="tracking-siasn">
            <SiasnTrackingLayanan nip={nip} />
          </Tabs.TabPane>
        </Tabs>
      </ActiveTabProvider>
    </>
  );
}

export default SiasnTab;
