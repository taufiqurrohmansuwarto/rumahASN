import { getPnsUnorByNip } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Card, Table } from "antd";

function ComparePnsUnorByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["pns-unor", nip],
    () => getPnsUnorByNip(nip),
    { enabled: !!nip }
  );

  const columns = [
    {
      title: "Nomor SK",
      dataIndex: "skNomor",
    },
    {
      title: "Tanggal SK",
      dataIndex: "skTanggal",
    },
    {
      title: "Unor Baru",
      dataIndex: "namaUnorBaru",
    },
    {
      title: "Asal Nama",
      dataIndex: "asalNama",
    },
    {
      title: "Asal Nama Label",
      dataIndex: "asalNamaLabel",
    },
  ];

  return (
    <Card title="Riwayat Unit Organisasi PNS">
      <Table
        pagination={false}
        columns={columns}
        dataSource={data}
        loading={isLoading}
      />
    </Card>
  );
}

export default ComparePnsUnorByNip;
