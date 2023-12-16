import { getRwPindahInstansiByNip } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Card, Table } from "antd";

function ComparePindahInstansiByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["rw-pindah-instansi", nip],
    () => getRwPindahInstansiByNip(nip),
    { enabled: !!nip }
  );

  const columns = [
    {
      title: "Nomer BKN",
      dataIndex: "skBknNomor",
    },
    {
      title: "Tanggal SK BKN",
      dataIndex: "skBknTanggal",
    },
    {
      title: "TMT PI",
      dataIndex: "tmtPi",
    },
    {
      title: "Nomer SK Asal",
      dataIndex: "skAsalNomor",
    },
    {
      title: "Nomer Tanggal SK Asal",
      dataIndex: "skAsalTanggal",
    },
    {
      title: "Nomer SK Tujuan",
      dataIndex: "skTujuanNomor",
    },
    {
      title: "Tanggal SK Tujuan",
      dataIndex: "skTujuanTanggal",
    },
    { title: "Jenis", dataIndex: "jenisPi" },
  ];

  return (
    <Card title="Riwayat Pindah Instansi SIASN">
      <Table
        columns={columns}
        pagination={false}
        dataSource={data}
        loading={isLoading}
        rowKey={(row) => row?.id}
      />
    </Card>
  );
}

export default ComparePindahInstansiByNip;
