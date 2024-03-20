import {
  dataAnak,
  dataOrtu,
  dataPasangan,
  dataRiwayatKeluargaSIASN,
} from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Card, Table, Tabs } from "antd";
import React from "react";

const OrangTua = ({ data, loading }) => {
  const columns = [
    { title: "Hubungan", dataIndex: "hubungan" },
    { title: "Nama", dataIndex: "nama" },
    { title: "Tanggal Lahir", dataIndex: "tglLahir" },
  ];

  return (
    <Table
      columns={columns}
      loading={loading}
      pagination={false}
      dataSource={data}
    />
  );
};

const Pasangan = ({ data, loading }) => {
  const columns = [
    { title: "Nama", key: "nama", render: (_, row) => <>{row?.orang?.nama}</> },
    {
      title: "Status Menikah",
      dataIndex: "statusNikah",
    },
  ];

  return (
    <>
      <Table
        loading={loading}
        columns={columns}
        pagination={false}
        dataSource={data}
      />
    </>
  );
};

function CompareDataKeluarga() {
  const { data: pasangan, isLoading: loadingPasangan } = useQuery(
    ["rw-pasangan"],
    () => dataPasangan(),
    {}
  );

  const { data: ortu, isLoading: loadingOrtu } = useQuery(
    ["rw-ortu"],
    () => dataOrtu(),
    {}
  );

  const { data: anak, isLoading: loadingAnak } = useQuery(
    ["rw-anak"],
    () => dataAnak(),
    {}
  );

  return (
    <Tabs defaultActiveKey="1" type="card" tabPosition="top">
      <Tabs.TabPane tab="Orang Tua" key="1">
        <Card>
          <OrangTua loading={loadingOrtu} data={ortu} />
        </Card>
      </Tabs.TabPane>
      <Tabs.TabPane tab="Anak" key="2">
        <Card>{JSON.stringify(anak)}</Card>
      </Tabs.TabPane>
      <Tabs.TabPane tab="Pasangan" key="3">
        <Card>
          <Pasangan loading={loadingPasangan} data={pasangan?.listPasangan} />
        </Card>
      </Tabs.TabPane>
    </Tabs>
  );
}

export default CompareDataKeluarga;
