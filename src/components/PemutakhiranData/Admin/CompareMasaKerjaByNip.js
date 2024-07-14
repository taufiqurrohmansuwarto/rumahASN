import { dataRiwayatMasaKerja } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Card, Space, Table } from "antd";

function CompareMasaKerjaByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["rw-masa-kerja", nip],
    () => dataRiwayatMasaKerja(nip),
    {
      refetchOnWindowFocus: false,
    }
  );

  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, record) => {
        return (
          <Space direction="horizontal">
            <div>
              {record?.path?.[1643] && (
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[1643]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Pertek
                </a>
              )}
            </div>
            <div>
              {record?.path?.[1644] && (
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[1644]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  SK
                </a>
              )}
            </div>
          </Space>
        );
      },
    },
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
  ];

  return (
    <Card title="Masa Kerja SIASN" loading={isLoading}>
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
