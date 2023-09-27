import { rwGolonganMaster } from "@/services/master.services";
import { getRwGolongan } from "@/services/siasn-services";
import { formatDateLL } from "@/utils/client-utils";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";

const DataGolonganSIMASTER = () => {
  const { data, isLoading } = useQuery(
    ["riwayat-golongan-pangkat-simster"],
    () => rwGolonganMaster(),
    {}
  );

  const columns = [
    {
      title: "File",
      key: "file",
      render: (text) => (
        <a href={text?.file_pangkat} target="_blank" rel="noreferrer">
          File
        </a>
      ),
    },
    {
      title: "Golongan",
      key: "Golongan",
      render: (text) => text?.pangkat?.gol_ruang,
    },
    ,
    {
      title: "Jenis Kenaikan Pangkat",
      key: "jenis_kp",
      render: (text) => text?.jenis_kp?.name,
    },
    {
      title: "TMT Golongan",
      dataIndex: "tmt_pangkat",
    },
    {
      title: "Tanggal SK",
      dataIndex: "tgl_sk",
    },
  ];

  return (
    <>
      <Table
        pagination={false}
        title={() => <b>RIWAYAT GOLONGAN SIMASTER</b>}
        columns={columns}
        loading={isLoading}
        dataSource={data}
        rowKey={(row) => row?.kp_id}
      />
    </>
  );
};

function CompareDataGolongan() {
  const { data, isLoading } = useQuery(
    ["riwayat-golongan-pangkat-siasn"],
    () => getRwGolongan(),
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
    {
      title: "Nomer SK",
      dataIndex: "skNomor",
    },
    {
      title: "Masa Kerja (Tahun)",
      dataIndex: "masaKerjaGolonganTahun",
    },
    {
      title: "TMT Golongan",
      key: "tmt_golongan",
      render: (text) => formatDateLL(text?.tmtGolongan),
    },
    {
      title: "Tanggal SK",
      dataIndex: "skTanggal",
    },
  ];

  return (
    <Stack>
      <Table
        title={() => <b>RIWAYAT GOLONGAN SIASN</b>}
        pagination={false}
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey={(row) => row?.id}
      />
      <DataGolonganSIMASTER />
    </Stack>
  );
}

export default CompareDataGolongan;
