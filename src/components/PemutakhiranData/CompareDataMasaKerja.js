import { dataMasaKerja } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";

function CompareDataMasaKerja() {
  const { data, isLoading } = useQuery(
    ["riwayat-masakerja"],
    () => dataMasaKerja(),
    {}
  );

  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, record) => {
        return (
          <>
            {record?.path?.[892] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[892]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                File
              </a>
            )}
          </>
        );
      },
    },
    {
      title: "Nama Penghargaan",
      dataIndex: "hargaNama",
    },
    {
      title: "Nomor SK",
      dataIndex: "skNomor",
    },
    {
      title: "Tanggal SK",
      dataIndex: "skDate",
    },
  ];

  return (
    <>
      <Table
        title={() => <b>RIWAYAT Masa Kerja SIASN</b>}
        pagination={false}
        dataSource={data}
        loading={isLoading}
        rowKey={(row) => row?.id}
      />
    </>
  );
}

export default CompareDataMasaKerja;
