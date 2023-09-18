import { dataPangkatByNip } from "@/services/siasn-services";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Card, Table } from "antd";
import moment from "moment";

const PangkatSiasn = ({ data }) => {
  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, row) => {
        return (
          <>
            {row?.path?.[858] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[858]?.dok_uri}`}
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
      title: "No. SK",
      dataIndex: "skNomor",
    },
    {
      title: "TMT Golongan",
      key: "tmt_golongan",
      render: (text) => <>{moment(text?.tmt_golongan).format("DD-MM-YYYY")}</>,
    },
    {
      title: "Tgl. SK",
      dataIndex: "skTanggal",
    },
  ];
  return (
    <>
      <Table
        columns={columns}
        title={() => <div>RIWAYAT PANGKAT SIASN</div>}
        pagination={false}
        dataSource={data}
        rowKey={(row) => row?.id}
      />
    </>
  );
};

const PangkatSimaster = ({ data }) => {
  const columns = [
    {
      title: "File",
      key: "file",
      render: (text) => {
        return (
          <>
            {text?.file_pangkat && (
              <a href={text?.file_pangkat} target="_blank" rel="noreferrer">
                File
              </a>
            )}
          </>
        );
      },
    },
    {
      title: "Pangkat",
      key: "pangkat",
      render: (text) => <span>{text?.pangkat?.pangkat}</span>,
    },
    {
      title: "No. SK",
      dataIndex: "no_sk",
    },
    {
      title: "TMT Pangkat",
      dataIndex: "tmt_pangkat",
    },
    {
      title: "Tgl. SK",
      dataIndex: "tgl_sk",
    },
    {
      title: "Aktif",
      dataIndex: "aktif",
    },
  ];
  return (
    <>
      <Table
        title={() => <span>RIWAYAT DATA PANGKAT SIMASTER</span>}
        pagination={false}
        columns={columns}
        dataSource={data}
        rowKey={(row) => row?.id}
      />
    </>
  );
};

function ComparePangkatByNip({ nip }) {
  const { data, isLoading } = useQuery(["data-riwayat-pangkat", nip], () =>
    dataPangkatByNip(nip)
  );

  return (
    <Card title="Komparasi Pangkat">
      <Stack>
        <PangkatSimaster data={data?.pangkat_simaster} />
        <PangkatSiasn data={data?.pangkat_siasn} />
      </Stack>
    </Card>
  );
}

export default ComparePangkatByNip;
