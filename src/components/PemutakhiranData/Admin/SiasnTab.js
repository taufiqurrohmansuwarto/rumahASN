import { Tabs } from "antd";
import CompareDataUtamaByNip from "./CompareDataUtamaByNip";

function SiasnTab({ nip }) {
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="Data Utama" key="1">
        <CompareDataUtamaByNip nip={nip} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Jabatan" key="2">
        <CompareDataUtamaByNip nip={nip} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Angka Kredit" key="3">
        <CompareDataUtamaByNip nip={nip} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="SKP 2022" key="4">
        <CompareDataUtamaByNip nip={nip} />
      </Tabs.TabPane>
    </Tabs>
  );
}

export default SiasnTab;
