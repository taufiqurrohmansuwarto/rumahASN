import { dataAnak, dataOrtu, dataPasangan } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Card, Table, Tabs } from "antd";

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
      rowKey={(row) => row?.id}
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
        rowKey={(row) => row?.id}
      />
    </>
  );
};

const Anak = ({ data, loading }) => {
  const columns = [
    {
      title: "Nama",
      dataIndex: "nama",
    },
    {
      title: "Jenis Kelamin",
      dataIndex: "jenisKelamin",
    },
    {
      title: "Tanggal Lahir",
      dataIndex: "tglLahir",
    },
  ];

  return <Table columns={columns} loading={loading} dataSource={data} />;
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
        <Anak loading={loadingAnak} data={anak} />
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
