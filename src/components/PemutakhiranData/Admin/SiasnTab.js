import { Tabs } from "antd";
import CompareAngkaKreditByNip from "./CompareAngkaKreditByNip";
import CompareDataUtamaByNip from "./CompareDataUtamaByNip";
import CompareJabatanByNip from "./CompareJabatanByNip";
import ComparePendidikanByNip from "./ComparePendidikanByNip";
import CompareSKP22ByNip from "./CompareSKP22ByNip";
import ComparePangkatByNip from "./ComparePangkatByNip";
import ComparePemberhentianByNip from "./ComparePemberhentianByNip";
import CompareMasaKerjaByNip from "./CompareMasaKerjaByNip";

function SiasnTab({ nip }) {
  return (
    <Tabs type="card" tabPosition="left" defaultActiveKey="1">
      <Tabs.TabPane tab="Data Utama" key="1">
        <CompareDataUtamaByNip nip={nip} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Jabatan" key="2">
        <CompareJabatanByNip nip={nip} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Pangkat" key="6">
        <ComparePangkatByNip nip={nip} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Angka Kredit" key="3">
        <CompareAngkaKreditByNip nip={nip} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="SKP 2022" key="4">
        <CompareSKP22ByNip nip={nip} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Pendidikan" key="5">
        <ComparePendidikanByNip nip={nip} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Pemberhentian" key="7">
        <ComparePemberhentianByNip nip={nip} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Masa Kerja" key="8">
        <CompareMasaKerjaByNip nip={nip} />
      </Tabs.TabPane>
    </Tabs>
  );
}

export default SiasnTab;
