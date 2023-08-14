import { dataPendidikan } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";

function CompareDataPendidikan() {
  const { data, isLoading } = useQuery(
    ["riwayat-pendidikan"],
    () => dataPendidikan(),
    {}
  );

  const columns = [
    {
      title: "Pendidikan",
      dataIndex: "pendidikanNama",
    },
    {
      title: "Nama Sekolah",
      dataIndex: "namaSekolah",
    },
  ];

  return (
    <>
      <Table
        title={() => <b>RIWAYAT DATA PENDIDIKAN SIASN</b>}
        pagination={false}
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey={(row) => row?.id}
      />
    </>
  );
}

export default CompareDataPendidikan;
