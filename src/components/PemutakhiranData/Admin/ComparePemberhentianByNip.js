import { rwPemberhentianByNip } from "@/services/siasn-services";
import { FilePdfOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Card, Space, Table, Tooltip } from "antd";

function ComparePemberhentianByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["rw-pemberhentian", nip],
    () => rwPemberhentianByNip(nip),
    {
      enabled: !!nip,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, row) => {
        return (
          <Space>
            {row?.pathSkPreview && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.pathSkPreview}`}
                target="_blank"
                rel="noreferrer"
              >
                <Tooltip title="File SK">
                  <FilePdfOutlined />
                </Tooltip>
              </a>
            )}
            {row?.pathPertek && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.pathPertek}`}
                target="_blank"
                rel="noreferrer"
              >
                <Tooltip title="File Pertek">
                  <FilePdfOutlined />
                </Tooltip>
              </a>
            )}
          </Space>
        );
      },
    },
    {
      title: "Jenis Pensiun",
      dataIndex: "detailLayananNama",
      responsive: ["md"],
    },
    {
      title: "Nomor SK",
      dataIndex: "skNomor",
      responsive: ["sm"],
    },
    {
      title: "Tanggal SK",
      dataIndex: "skTgl",
      responsive: ["md"],
    },
    {
      title: "TMT Pensiun",
      dataIndex: "tmtPensiun",
    },
    {
      title: "Status Usulan",
      dataIndex: "statusUsulanNama",
      responsive: ["lg"],
    },
  ];

  return (
    <Card title="Riwayat Pemberhentian" loading={isLoading}>
      <Table
        pagination={false}
        columns={columns}
        rowKey={(row) => row?.id}
        dataSource={data}
        scroll={{ x: true }}
        responsive
      />
    </Card>
  );
}

export default ComparePemberhentianByNip;
