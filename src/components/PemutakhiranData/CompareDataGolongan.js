import { rwGolonganMaster } from "@/services/master.services";
import { getRwGolongan } from "@/services/siasn-services";
import { formatDateLL } from "@/utils/client-utils";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Descriptions, Table } from "antd";
import { orderBy } from "lodash";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

const DataGolonganSIMASTER = () => {
  const { data, isLoading } = useQuery(
    ["riwayat-golongan-pangkat-simster"],
    () => rwGolonganMaster(),
    {}
  );

  const columns = [
    {
      title: "Data",
      key: "data",
      responsive: ["xs"],
      render: (_, record) => {
        return (
          <Descriptions size="small" layout="vertical">
            <Descriptions.Item label="File">
              <a href={record?.file_pangkat} target="_blank" rel="noreferrer">
                File
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Golongan">
              {record?.pangkat?.gol_ruang}
            </Descriptions.Item>
            <Descriptions.Item label="Jenis Kenaikan Pangkat">
              {record?.jenis_kp?.name}
            </Descriptions.Item>
            <Descriptions.Item label="TMT Golongan">
              {formatDateLL(record?.tmt_pangkat)}
            </Descriptions.Item>
            <Descriptions.Item label="Tanggal SK">
              {record?.tgl_sk}
            </Descriptions.Item>
          </Descriptions>
        );
      },
    },
    {
      title: "File",
      key: "file",
      render: (text) => (
        <a href={text?.file_pangkat} target="_blank" rel="noreferrer">
          File
        </a>
      ),
      responsive: ["sm"],
    },
    {
      title: "Golongan",
      key: "Golongan",
      render: (text) => text?.pangkat?.gol_ruang,
      responsive: ["sm"],
    },
    ,
    {
      title: "Jenis Kenaikan Pangkat",
      key: "jenis_kp",
      render: (text) => text?.jenis_kp?.name,
      responsive: ["sm"],
    },
    {
      title: "TMT Golongan",
      key: "tmt_golongan",
      render: (text) => <>{text?.tmt_pangkat}</>,
      responsive: ["sm"],
    },
    {
      title: "Tanggal SK",
      dataIndex: "tgl_sk",
      responsive: ["sm"],
    },
  ];

  return (
    <>
      <Table
        pagination={false}
        title={() => <b>RIWAYAT GOLONGAN SIMASTER</b>}
        columns={columns}
        loading={isLoading}
        dataSource={orderBy(
          data,
          [
            (o) => {
              return dayjs(o.tmtGolongan).valueOf();
            },
          ],
          ["desc"]
        )}
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
      title: "Data",
      key: "data",
      responsive: ["xs"],
      render: (_, record) => {
        return (
          <Descriptions layout="vertical" size="small">
            <Descriptions.Item label="File">
              {record?.path?.[858] && (
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[858]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  File
                </a>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Golongan">
              {record?.golongan}
            </Descriptions.Item>
            <Descriptions.Item label="Jenis Kenaikan Pangkat">
              {record?.jenisKPNama}
            </Descriptions.Item>
            <Descriptions.Item label="Nomer SK">
              {record?.skNomor} - {record?.skTanggal}
            </Descriptions.Item>
            <Descriptions.Item label="Masa Kerja (Tahun)">
              {record?.masaKerjaGolonganTahun}
            </Descriptions.Item>
            <Descriptions.Item label="TMT Golongan">
              {formatDateLL(record?.tmtGolongan)}
            </Descriptions.Item>
            <Descriptions.Item label="Tanggal SK">
              {record?.skTanggal}
            </Descriptions.Item>
          </Descriptions>
        );
      },
    },
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
      responsive: ["sm"],
    },
    {
      title: "Golongan",
      dataIndex: "golongan",
      responsive: ["sm"],
    },
    {
      title: "Jenis Kenaikan Pangkat",
      dataIndex: "jenisKPNama",
      responsive: ["sm"],
    },
    {
      title: "Nomer SK",
      dataIndex: "skNomor",
      responsive: ["sm"],
    },
    {
      title: "Masa Kerja (Tahun)",
      dataIndex: "masaKerjaGolonganTahun",
      responsive: ["sm"],
    },
    {
      title: "TMT Golongan",
      key: "tmt_golongan",
      render: (text) => formatDateLL(text?.tmtGolongan),
      responsive: ["sm"],
    },
    {
      title: "Tanggal SK",
      dataIndex: "skTanggal",
      responsive: ["sm"],
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
