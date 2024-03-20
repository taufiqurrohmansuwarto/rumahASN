import { dataCltn } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";

function CompareDataCltn() {
  const { data, isLoading } = useQuery(["riwayat-cltn"], () => dataCltn(), {});

  const columns = [
    {
      title: "Nomer Letter BKN",
      dataIndex: "nomorLetterBkn",
    },
    {
      title: "Nomor SK",
      dataIndex: "skNomor",
    },
    {
      title: "Tanggal SK",
      dataIndex: "skTanggal",
    },
    {
      title: "Tanggal Akhir",
      dataIndex: "tanggalAkhir",
    },
    {
      title: "Tgl. Aktif",
      dataIndex: "tanggalAktif",
    },
    {
      title: "Tgl. Awal",
      dataIndex: "tanggalAwal",
    },
    {
      title: "Tgl. Letter BKN",
      dataIndex: "tanggalLetterBkn",
    },
  ];

  return (
    <>
      <Table
        title={() => <b>Riwayat CLTN SIASN</b>}
        pagination={false}
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey={(row) => row?.id}
      />
    </>
  );
}

export default CompareDataCltn;
