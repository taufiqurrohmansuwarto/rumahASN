import { FloatButton, Grid, Tabs } from "antd";
import CompareDataDiklatByNip from "../CompareDataDiklatByNip";
import ComparePenghargaanByNip from "../ComparePenghargaanByNip";
import CompareAngkaKreditByNip from "./CompareAngkaKreditByNip";
import CompareCLTNByNip from "./CompareCLTNByNip";
import CompareDataUtamaByNip from "./CompareDataUtamaByNip";
import CompareHukdisByNip from "./CompareHukdisByNip";
import CompareJabatanByNip from "./CompareJabatanByNip";
import CompareJabatanDokterByNip from "./CompareJabatanDokterByNip";
import CompareJabatanGuruByNip from "./CompareJabatanGuruByNip";
import CompareKedudukanHukumByNip from "./CompareKedudukanHukumByNip";
import CompareKeluargaByNip from "./CompareKeluargaByNip";
import CompareMasaKerjaByNip from "./CompareMasaKerjaByNip";
import ComparePangkatByNip from "./ComparePangkatByNip";
import ComparePemberhentianByNip from "./ComparePemberhentianByNip";
import ComparePendidikanByNip from "./ComparePendidikanByNip";
import ComparePindahInstansiByNip from "./ComparePindahInstansiByNip";
import ComparePwkByNip from "./ComparePwkByNip";
import CompareSKP22ByNip from "./CompareSKP22ByNip";
import AdministrasiByNip from "@/components/Berkas/AdministrasiByNip";
import ComparePnsUnorByNip from "./ComparePnsUnorByNip";

function SiasnTab({ nip }) {
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <FloatButton.BackTop />
      <Tabs
        type="card"
        tabPosition={breakPoint.xs ? "top" : "left"}
        defaultActiveKey="1"
      >
        <Tabs.TabPane tab="Data Utama" key="1">
          <CompareDataUtamaByNip nip={nip} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Info" key="2">
          <CompareJabatanByNip nip={nip} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Jabatan Guru" key="jabatan_guru">
          <CompareJabatanGuruByNip nip={nip} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Jabatan Dokter" key="jabatan_dokter">
          <CompareJabatanDokterByNip nip={nip} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Pangkat & Golongan" key="6">
          <ComparePangkatByNip nip={nip} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Angka Kredit" key="3">
          <CompareAngkaKreditByNip nip={nip} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Kinerja" key="4">
          <CompareSKP22ByNip nip={nip} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Pendidikan" key="5">
          <ComparePendidikanByNip nip={nip} />
        </Tabs.TabPane>
        {/* <Tabs.TabPane tab="Pencantuman Gelar" key="pencantuman-gelar">
        <PencantumanGelarByNip nip={nip} />
      </Tabs.TabPane> */}
        <Tabs.TabPane tab="Diklat dan Kursus" key="diklat">
          <CompareDataDiklatByNip nip={nip} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Pemberhentian" key="7">
          <ComparePemberhentianByNip nip={nip} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Kedudukan Hukum" key="9">
          <CompareKedudukanHukumByNip nip={nip} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Keluarga" key="rw-keluarga">
          <CompareKeluargaByNip nip={nip} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Berkas" key="berkas">
          <AdministrasiByNip />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Masa Kerja" key="8">
          <CompareMasaKerjaByNip nip={nip} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Pindah Instansi" key="15">
          <ComparePindahInstansiByNip nip={nip} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Pindah Wilayah Kerja" key="pwk">
          <ComparePwkByNip nip={nip} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Hukuman Disiplin" key="hukdis">
          <CompareHukdisByNip nip={nip} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="PNS Unor" key="pns-unor">
          <ComparePnsUnorByNip nip={nip} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="CLTN" key="cltn">
          <CompareCLTNByNip nip={nip} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Penghargaan" key="penghargaan">
          <ComparePenghargaanByNip nip={nip} />
        </Tabs.TabPane>
      </Tabs>
    </>
  );
}

export default SiasnTab;
