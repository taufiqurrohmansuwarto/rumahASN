import { Tabs } from "antd";
import CompareDataUtamaByNip from "./CompareDataUtamaByNip";
import CompareJabatanByNip from "./CompareJabatanByNip";
import CompareAngkaKreditByNip from "./CompareAngkaKreditByNip";
import CompareSKP22ByNip from "./CompareSKP22ByNip";

function SiasnTab({ nip }) {
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="Data Utama" key="1">
        <CompareDataUtamaByNip nip={nip} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Jabatan" key="2">
        <CompareJabatanByNip nip={nip} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Angka Kredit" key="3">
        <CompareAngkaKreditByNip nip={nip} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="SKP 2022" key="4">
        <CompareSKP22ByNip nip={nip} />
      </Tabs.TabPane>
    </Tabs>
  );
}

export default SiasnTab;
