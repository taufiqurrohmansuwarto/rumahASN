import { dataMasaKerja } from "@/services/siasn-services";
import { FilePdfOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Space, Table, Tooltip } from "antd";

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
      render: (_, row) => {
        return (
          <>
            <Space>
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[1643]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                <Tooltip title="Pertek PMK">
                  <FilePdfOutlined />
                </Tooltip>
              </a>
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[1644]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                <Tooltip title="SK PMK">
                  <FilePdfOutlined />
                </Tooltip>
              </a>
            </Space>
          </>
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
      title: "No. SK",
      dataIndex: "nomorSk",
    },
    {
      title: "No. BKN",
      dataIndex: "nomorBkn",
    },
    {
      title: "Tgl. BKN",
      dataIndex: "tanggalBkn",
    },
    {
      title: "Masa Kerja (Tahun)",
      dataIndex: "tasaKerjaTahun",
    },
    {
      title: "Masa Kerja (Bulan)",
      dataIndex: "masaKerjaBulan",
    },
  ];

  return (
    <>
      <Table
        columns={columns}
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
