import { dataRiwayatMasaKerja } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Card, Table } from "antd";

function CompareMasaKerjaByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["rw-masa-kerja", nip],
    () => dataRiwayatMasaKerja(nip),
    {}
  );

  const columns = [
    {
      title: "Pengalaman",
      dataIndex: "pengalaman",
    },
    {
      title: "Tanggal Awal",
      dataIndex: "tanggalAwal",
    },
    {
      title: "Tanggal Selesai",
      dataIndex: "tanggalSelesai",
    },
    {
      title: "Nomor SK",
      dataIndex: "nomorSk",
    },
    {
      title: "Tanggal SK",
      dataIndex: "tanggalSk",
    },
    {
      title: "Masa Kerja",
      key: "masakerja",
      render: (_, row) => {
        return (
          <>
            {row?.tasaKerjaTahun} tahun {row?.masaKerjaBulan} bulan
          </>
        );
      },
    },
    {
      title: "Nilai",
      dataIndex: "dinilai",
    },
  ];

  return (
    <Card title="Riwayat Masa Kerja SIASN" loading={isLoading}>
      <Table
        pagination={false}
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey={(row) => row?.id}
      />
    </Card>
  );
}

export default CompareMasaKerjaByNip;
