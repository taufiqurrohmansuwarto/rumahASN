import { rwJabDokterByNip } from "@/services/master.services";
import { useQuery } from "@tanstack/react-query";
import { Card, Table } from "antd";

function CompareJabatanDokterByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["rw-jabatan-dokter", nip],
    () => rwJabDokterByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const columns = [
    {
      title: "Jenis Dokter",
      key: "jenis_dokter",
      render: (_, row) => row?.jenis?.jenis_dokter,
    },
    {
      title: "Spesialis",
      key: "spesialis",
      render: (_, row) => row?.spesialis?.spesialis_dokter,
    },
    {
      title: "Unit Kesehatan",
      key: "unit_kesehatan",
      render: (_, row) => row?.unit?.unit_kesehatan,
    },
    {
      title: "Nama Unit Kesehatan",
      dataIndex: "nama_unit_kesehatan",
    },
    {
      title: "Jumlah Pasien",
      dataIndex: "jml_pasien",
    },
  ];

  return (
    <Card title="Jabatan Dokter">
      <Table
        columns={columns}
        pagination={false}
        loading={isLoading}
        dataSource={data}
        rowKey={(row) => row?.pegawai_id}
      />
    </Card>
  );
}

export default CompareJabatanDokterByNip;
