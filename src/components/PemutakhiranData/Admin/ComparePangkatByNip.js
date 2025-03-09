import { dataPangkatByNip } from "@/services/siasn-services";
import { findGolongan, findPangkat } from "@/utils/client-utils";
import { Stack, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Card, Table } from "antd";
import { orderBy } from "lodash";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

const PangkatSiasn = ({ data, isLoading }) => {
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
      title: "Pangkat",
      key: "Pangkat",
      render: (_, record) => (
        <>
          {findPangkat(record?.golonganId)} - (
          {findGolongan(record?.golonganId)})
        </>
      ),
    },
    {
      title: "No. SK",
      dataIndex: "skNomor",
    },
    {
      title: "TMT Golongan",
      key: "tmt_golongan",
      render: (text) => <>{dayjs(text?.tmtGolongan).format("DD-MM-YYYY")}</>,
    },

    {
      title: "Tgl. SK",
      dataIndex: "skTanggal",
    },
  ];
  return (
    <>
      <Table
        loading={isLoading}
        columns={columns}
        title={() => <Text fw="bold">SIASN</Text>}
        pagination={false}
        dataSource={orderBy(
          data,
          [
            (o) => {
              return dayjs(o.tmtGolongan).valueOf();
            },
          ],
          ["desc"]
        )}
        rowKey={(row) => row?.id}
      />
    </>
  );
};

const PangkatSimaster = ({ data, isLoading }) => {
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
      render: (text) => (
        <span>
          {text?.pangkat?.pangkat} - ({text?.pangkat?.gol_ruang})
        </span>
      ),
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
        loading={isLoading}
        title={() => <Text fw="bold">SIMASTER</Text>}
        pagination={false}
        columns={columns}
        dataSource={data}
        rowKey={(row) => row?.id}
      />
    </>
  );
};

function ComparePangkatByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["data-riwayat-pangkat", nip],
    () => dataPangkatByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  return (
    <Card title="Komparasi Pangkat">
      <Stack>
        <PangkatSiasn isLoading={isLoading} data={data?.pangkat_siasn} />
        <PangkatSimaster isLoading={isLoading} data={data?.pangkat_simaster} />
      </Stack>
    </Card>
  );
}

export default ComparePangkatByNip;
