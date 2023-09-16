import { Table, Tabs } from "antd";
import React from "react";

const OrangTua = ({ data }) => {
  const columns = [
    { title: "Hubungan", dataIndex: "hubungan_ortu" },
    { title: "Nama", dataIndex: "nama" },
    { title: "Tanggal Lahir", dataIndex: "tanggal_lahir" },
  ];

  return <Table columns={columns} pagination={false} dataSource={data?.ortu} />;
};

const Pasangan = ({ data }) => {
  const columns = [{ title: "Nama", dataIndex: "nama" }];

  return (
    <Table columns={columns} pagination={false} dataSource={data?.pasangan} />
  );
};

function CompareDataKeluarga({ data }) {
  return (
    <Tabs defaultActiveKey="1" type="card" tabPosition="left">
      <Tabs.TabPane tab="Orang Tua" key="1">
        <OrangTua data={data} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Anak" key="2">
        Content of Tab Pane 2
      </Tabs.TabPane>
      <Tabs.TabPane tab="Pasangan" key="3">
        <Pasangan data={data} />
      </Tabs.TabPane>
    </Tabs>
  );
}

export default CompareDataKeluarga;
