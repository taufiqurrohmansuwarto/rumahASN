import { dataGolongan } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";

function CompareDataGolongan() {
  const { data, isLoading } = useQuery(
    ["riwayat-golongan"],
    () => dataGolongan(),
    {}
  );

  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, record) => {
        return (
          <>
            {record?.path?.[858] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[858]?.dok_uri}`}
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
      title: "Golongan",
      dataIndex: "golongan",
    },
    {
      title: "Jenis Kenaikan Pangkat",
      dataIndex: "jenisKPNama",
    },
  ];

  return (
    <>
      <Table
        title={() => <b>RIWAYAT GOLONGAN SIASN</b>}
        pagination={false}
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey={(row) => row?.id}
      />
    </>
  );
}

export default CompareDataGolongan;
